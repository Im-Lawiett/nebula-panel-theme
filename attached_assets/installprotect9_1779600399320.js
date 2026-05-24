const { NodeSSH } = require("node-ssh")
const ssh = new NodeSSH()
const fs = require("fs")
const path = require("path")

module.exports = async (bot, msg, session) => {
  const chatId = msg.message.chat.id
  const userId = msg.from.id.toString()

  if (!session || !session.host) {
    return bot.sendMessage(
      chatId,
      "⚠️ Kamu belum login ke VPS!\nGunakan perintah `/loginvps ip|password` terlebih dahulu.",
      { parse_mode: "Markdown" }
    )
  }

  const filePath = "/var/www/pterodactyl/app/Http/Controllers/Admin/ApiController.php"

  const phpCode = `<?php

namespace Pterodactyl\\Http\\Controllers\\Admin;

use Illuminate\\View\\View;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Response;
use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Models\\ApiKey;
use Illuminate\\Http\\RedirectResponse;
use Prologue\\Alerts\\AlertsMessageBag;
use Pterodactyl\\Services\\Acl\\Api\\AdminAcl;
use Illuminate\\View\\Factory as ViewFactory;
use Pterodactyl\\Http\\Controllers\\Controller;
use Pterodactyl\\Services\\Api\\KeyCreationService;
use Pterodactyl\\Contracts\\Repository\\ApiKeyRepositoryInterface;
use Pterodactyl\\Http\\Requests\\Admin\\Api\\StoreApplicationApiKeyRequest;

class ApiController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private ApiKeyRepositoryInterface $repository,
        private KeyCreationService $keyCreationService,
        private ViewFactory $view,
    ) {}

    private function protectAccess()
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Kasihan gabisa yaaa? 😹 Hanya Admin utama (ID 1) yang dapat mengakses halaman APIKEY! ©Protect By @RianModss');
        }
    }

    public function index(Request $request): View
    {
        $this->protectAccess();

        return $this->view->make('admin.api.index', [
            'keys' => $this->repository->getApplicationKeys($request->user()),
        ]);
    }

    public function create(): View
    {
        $this->protectAccess();

        $resources = AdminAcl::getResourceList();
        sort($resources);

        return $this->view->make('admin.api.new', [
            'resources' => $resources,
            'permissions' => [
                'r' => AdminAcl::READ,
                'rw' => AdminAcl::READ | AdminAcl::WRITE,
                'n' => AdminAcl::NONE,
            ],
        ]);
    }

    public function store(StoreApplicationApiKeyRequest $request): RedirectResponse
    {
        $this->protectAccess();

        $this->keyCreationService->setKeyType(ApiKey::TYPE_APPLICATION)->handle([
            'memo' => $request->input('memo'),
            'user_id' => $request->user()->id,
        ], $request->getKeyPermissions());

        $this->alert->success('✅ API Key baru berhasil dibuat untuk Admin utama.')->flash();
        return redirect()->route('admin.api.index');
    }

    public function delete(Request $request, string $identifier): Response
    {
        $this->protectAccess();
        $this->repository->deleteApplicationKey($request->user(), $identifier);

        return response('', 204);
    }
}
`.trim()

  try {
    await ssh.connect({
      host: session.host,
      username: session.username,
      password: session.password,
      port: session.port || 22
    })

    const tempFile = path.join(__dirname, "ApiController.php")
    fs.writeFileSync(tempFile, phpCode)

    await ssh.putFile(tempFile, filePath)
    fs.unlinkSync(tempFile)

    await bot.sendMessage(
      chatId,
      `🔐 *Sukses Installasi Protect 9!*

⚙️ *Security:*  
_Membatasi akses Application API *khusus Admin ID 1*._

- Hanya Admin 1 bisa membuka, membuat, dan menghapus APIKEY.
- User lain otomatis *403 Forbidden* bahkan tidak bisa membuka menu tersebut.

📂 *Lokasi File:*  
\`${filePath}\``,
      { parse_mode: "Markdown" }
    )

    ssh.dispose()
    console.log(`🟢 Install Protect 9 aktif untuk user ${userId} di VPS ${session.host}`)
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT9:", err)
    bot.sendMessage(
      chatId,
      `❌ Gagal memasang PROTECT9.\n\nError:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    )
  }
}