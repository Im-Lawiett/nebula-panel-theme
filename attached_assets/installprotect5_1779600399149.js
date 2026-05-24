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

  const protectFiles = [
    {
      name: "(Anti Intip Nests)",
      path: "/var/www/pterodactyl/app/Http/Controllers/Admin/Nests/NestController.php",
      file: "NestController.php",
      code: `<?php

namespace Pterodactyl\\Http\\Controllers\\Admin\\Nests;

use Illuminate\\View\\View;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Support\\Facades\\Auth;
use Prologue\\Alerts\\AlertsMessageBag;
use Illuminate\\View\\Factory as ViewFactory;
use Pterodactyl\\Http\\Controllers\\Controller;
use Pterodactyl\\Services\\Nests\\NestUpdateService;
use Pterodactyl\\Services\\Nests\\NestCreationService;
use Pterodactyl\\Services\\Nests\\NestDeletionService;
use Pterodactyl\\Contracts\\Repository\\NestRepositoryInterface;
use Pterodactyl\\Http\\Requests\\Admin\\Nest\\StoreNestFormRequest;
use Pterodactyl\\Exceptions\\DisplayException;

class NestController extends Controller
{
    public function __construct(
        protected AlertsMessageBag $alert,
        protected NestCreationService $nestCreationService,
        protected NestDeletionService $nestDeletionService,
        protected NestRepositoryInterface $repository,
        protected NestUpdateService $nestUpdateService,
        protected ViewFactory $view
    ) {
    }

    private function checkAdminAccess(): void
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak! Hanya Admin utama (ID 1) yang dapat membuka menu Nests. ©Protect By @RianModss');
        }
    }

    public function index(): View
    {
        $this->checkAdminAccess();

        return $this->view->make('admin.nests.index', [
            'nests' => $this->repository->getWithCounts(),
        ]);
    }

    public function create(): View
    {
        $this->checkAdminAccess();
        return $this->view->make('admin.nests.new');
    }

    public function store(StoreNestFormRequest $request): RedirectResponse
    {
        $this->checkAdminAccess();
        $nest = $this->nestCreationService->handle($request->normalize());
        $this->alert->success('✅ Nest berhasil dibuat.')->flash();
        return redirect()->route('admin.nests.view', $nest->id);
    }

    public function view(int $nest): View
    {
        $this->checkAdminAccess();
        return $this->view->make('admin.nests.view', [
            'nest' => $this->repository->getWithEggServers($nest),
        ]);
    }

    public function update(StoreNestFormRequest $request, int $nest): RedirectResponse
    {
        $this->checkAdminAccess();
        $this->nestUpdateService->handle($nest, $request->normalize());
        $this->alert->success('✅ Nest berhasil diperbarui.')->flash();
        return redirect()->route('admin.nests.view', $nest);
    }

    public function destroy(int $nest): RedirectResponse
    {
        $this->checkAdminAccess();
        try {
            $this->nestDeletionService->handle($nest);
            $this->alert->success('🗑️ Nest berhasil dihapus.')->flash();
            return redirect()->route('admin.nests');
        } catch (DisplayException $ex) {
            $this->alert->danger($ex->getMessage())->flash();
        }
        return redirect()->route('admin.nests.view', $nest);
    }
}
`.trim()
    }
  ]

  try {
    await ssh.connect({
      host: session.host,
      username: session.username,
      password: session.password,
      port: session.port || 22
    })

    let successCount = 0

    for (const file of protectFiles) {
      try {
        const tempFile = path.join(__dirname, file.file)
        fs.writeFileSync(tempFile, file.code)
        await ssh.putFile(tempFile, file.path)
        fs.unlinkSync(tempFile)

        successCount++

        await bot.sendMessage(
          chatId,
          `✅ *${file.name}*\n\n📂 \`${file.path}\``,
          { parse_mode: "Markdown" }
        )
      } catch (err) {
        await bot.sendMessage(
          chatId,
          `❌ Gagal memasang *${file.name}*\nError: \`${err.message}\``,
          { parse_mode: "Markdown" }
        )
      }
    }

    ssh.dispose()

    await bot.sendMessage(
      chatId,
      `🔐 *Sukses Installasi Protect 5!*

⚠️ *Security:*
_Menu tab *Nests* sekarang hanya bisa diakses Admin utama (ID 1)._

✅ *Total: ${successCount}/${protectFiles.length} file*`,
      { parse_mode: "Markdown", reply_to_message_id: msg.message_id }
    )

    console.log(`🟢 InstallProtect5 selesai untuk user ${msg.from.id} di VPS ${session.host}`)
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT5:", err)
    bot.sendMessage(
      chatId,
      `❌ Gagal menjalankan instalasi Protect5.\n\nError:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    )
  }
}