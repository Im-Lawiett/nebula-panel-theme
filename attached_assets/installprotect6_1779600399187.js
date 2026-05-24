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

  const filePath = "/var/www/pterodactyl/app/Http/Controllers/Admin/Settings/IndexController.php"

  const phpCode = `<?php

namespace Pterodactyl\\Http\\Controllers\\Admin\\Settings;

use Illuminate\\View\\View;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Support\\Facades\\Auth;
use Prologue\\Alerts\\AlertsMessageBag;
use Illuminate\\Contracts\\Console\\Kernel;
use Illuminate\\View\\Factory as ViewFactory;
use Pterodactyl\\Http\\Controllers\\Controller;
use Pterodactyl\\Traits\\Helpers\\AvailableLanguages;
use Pterodactyl\\Services\\Helpers\\SoftwareVersionService;
use Pterodactyl\\Contracts\\Repository\\SettingsRepositoryInterface;
use Pterodactyl\\Http\\Requests\\Admin\\Settings\\BaseSettingsFormRequest;

class IndexController extends Controller
{
    use AvailableLanguages;

    public function __construct(
        private AlertsMessageBag $alert,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
        private SoftwareVersionService $versionService,
        private ViewFactory $view
    ) {
    }

    public function index(): View
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin ID 1 yang dapat membuka menu Settings! ©Protect By @RianModss.');
        }

        return $this->view->make('admin.settings.index', [
            'version' => $this->versionService,
            'languages' => $this->getAvailableLanguages(true),
        ]);
    }

    public function update(BaseSettingsFormRequest $request): RedirectResponse
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin ID 1 yang dapat update menu Settings! ©Protect By @RianModss.');
        }

        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->kernel->call('queue:restart');
        $this->alert->success(
            'Panel settings have been updated successfully and the queue worker was restarted to apply these changes.'
        )->flash();

        return redirect()->route('admin.settings');
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

    const tempFile = path.join(__dirname, "IndexController.php")
    fs.writeFileSync(tempFile, phpCode)

    await ssh.putFile(tempFile, filePath)
    fs.unlinkSync(tempFile)

    await bot.sendMessage(
      chatId,
      `🔐 *Sukses Installasi Protect 6!*

_Membatasi akses user ke *menu Settings* hanya untuk *Admin utama (ID 1)*._

⚠️ *Security:*  
- Hanya Admin ID 1 yang bisa membuka dan mengubah konfigurasi panel.  
- User lain *tidak bisa membuka halaman Settings*.  
- Akses ilegal akan langsung *403 Forbidden*.

📂 *Lokasi File:*  
\`${filePath}\``,
      { parse_mode: "Markdown" }
    )

    ssh.dispose()
    console.log(`🟢 Install Protect 6 aktif untuk user ${userId} di VPS ${session.host}`)
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT6:", err)
    bot.sendMessage(
      chatId,
      `❌ Gagal memasang PROTECT6.\n\nError:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    )
  }
}