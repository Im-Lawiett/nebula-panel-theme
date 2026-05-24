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

  const filePath = "/var/www/pterodactyl/app/Http/Controllers/Api/Client/Servers/ServerController.php"

  const phpCode = `<?php

namespace Pterodactyl\\Http\\Controllers\\Api\\Client\\Servers;

use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Models\\Server;
use Pterodactyl\\Transformers\\Api\\Client\\ServerTransformer;
use Pterodactyl\\Services\\Servers\\GetUserPermissionsService;
use Pterodactyl\\Http\\Controllers\\Api\\Client\\ClientApiController;
use Pterodactyl\\Http\\Requests\\Api\\Client\\Servers\\GetServerRequest;

class ServerController extends ClientApiController
{
    public function __construct(private GetUserPermissionsService $permissionsService)
    {
        parent::__construct();
    }

    public function index(GetServerRequest $request, Server $server): array
    {
        $authUser = Auth::user();

        if (!$authUser) {
            abort(403, '🚫 Tidak dapat memverifikasi pengguna. Silakan login ulang.');
        }

        if ($authUser->id !== 1 && (int) $server->owner_id !== (int) $authUser->id) {
            abort(403, '🚫 Kasihan gabisa yaaa? 😹 Hanya Admin utama (ID 1) atau pemilik server yang dapat melihat server ini! ©Protect By @RianModss');
        }

        return $this->fractal->item($server)
            ->transformWith($this->getTransformer(ServerTransformer::class))
            ->addMeta([
                'is_server_owner' => $authUser->id === $server->owner_id,
                'user_permissions' => $this->permissionsService->handle($server, $authUser),
            ])
            ->toArray();
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

    const tempFile = path.join(__dirname, "ServerController.php")
    fs.writeFileSync(tempFile, phpCode)

    await ssh.putFile(tempFile, filePath)
    fs.unlinkSync(tempFile)

    await bot.sendMessage(
      chatId,
      `🔐 *Sukses Installasi Protect 8!*

⚠️ *Security:*  
_Mencegah user melihat detail server orang lain (*anti intip*)._

- Hanya *Admin ID 1 & Owner server* yang dapat membuka halaman Server.  
- User lain otomatis *403 Forbidden*.

📂 *Lokasi File:*  
\`${filePath}\``,
      { parse_mode: "Markdown" }
    )
      
    ssh.dispose()
    console.log(`🟢 Install Protect 8 aktif untuk user ${userId} di VPS \`${session.host}\``)
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT8:", err)
    bot.sendMessage(
      chatId,
      `❌ Gagal memasang PROTECT8.\nError: ${err.message}`,
      { parse_mode: "Markdown" }
    )
  }
}