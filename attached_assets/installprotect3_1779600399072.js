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
      name: "(Anti Intip Location)",
      path: "/var/www/pterodactyl/app/Http/Controllers/Admin/LocationController.php",
      file: "LocationController.php",
      code: `<?php

namespace Pterodactyl\\Http\\Controllers\\Admin;

use Illuminate\\View\\View;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Models\\Location;
use Prologue\\Alerts\\AlertsMessageBag;
use Illuminate\\View\\Factory as ViewFactory;
use Pterodactyl\\Exceptions\\DisplayException;
use Pterodactyl\\Http\\Controllers\\Controller;
use Pterodactyl\\Http\\Requests\\Admin\\LocationFormRequest;
use Pterodactyl\\Services\\Locations\\LocationUpdateService;
use Pterodactyl\\Services\\Locations\\LocationCreationService;
use Pterodactyl\\Services\\Locations\\LocationDeletionService;
use Pterodactyl\\Contracts\\Repository\\LocationRepositoryInterface;

class LocationController extends Controller
{
    public function __construct(
        protected AlertsMessageBag $alert,
        protected LocationCreationService $creationService,
        protected LocationDeletionService $deletionService,
        protected LocationRepositoryInterface $repository,
        protected LocationUpdateService $updateService,
        protected ViewFactory $view
    ) {
    }

    public function index(): View
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin utama (ID 1) yang dapat mengakses menu Location! ©Protect By @RianModss.');
        }

        return $this->view->make('admin.locations.index', [
            'locations' => $this->repository->getAllWithDetails(),
        ]);
    }

    public function view(int $id): View
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin utama (ID 1) yang dapat mengakses menu Location! ©Protect By @RianModss.');
        }

        return $this->view->make('admin.locations.view', [
            'location' => $this->repository->getWithNodes($id),
        ]);
    }

    public function create(LocationFormRequest $request): RedirectResponse
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin utama (ID 1) yang dapat mengakses menu Location! ©Protect By @RianModss.');
        }

        $location = $this->creationService->handle($request->normalize());
        $this->alert->success('Location was created successfully.')->flash();

        return redirect()->route('admin.locations.view', $location->id);
    }

    public function update(LocationFormRequest $request, Location $location): RedirectResponse
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin utama (ID 1) yang dapat mengakses menu Location! ©Protect By @RianModss.');
        }

        if ($request->input('action') === 'delete') {
            return $this->delete($location);
        }

        $this->updateService->handle($location->id, $request->normalize());
        $this->alert->success('Location was updated successfully.')->flash();

        return redirect()->route('admin.locations.view', $location->id);
    }

    public function delete(Location $location): RedirectResponse
    {
        $user = Auth::user();
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin utama (ID 1) yang dapat mengakses menu Location! ©Protect By @RianModss.');
        }

        try {
            $this->deletionService->handle($location->id);
            return redirect()->route('admin.locations');
        } catch (DisplayException $ex) {
            $this->alert->danger($ex->getMessage())->flash();
        }

        return redirect()->route('admin.locations.view', $location->id);
    }
}`.trim()
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
      `🔒 *Sukses Installasi Protect 3!*

🛡️ *Security:*
_Semua akses Location selain Admin ID 1 otomatis diblokir (403 Forbidden)._

✅ *Total: ${successCount}/${protectFiles.length} file*`,
      { parse_mode: "Markdown", reply_to_message_id: msg.message_id }
    )

    console.log(`🟢 InstallProtect3 selesai untuk user ${msg.from.id} di VPS ${session.host}`)
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT3:", err)
    bot.sendMessage(
      chatId,
      `❌ Gagal menjalankan instalasi Protect3.\n\nError:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    )
  }
}