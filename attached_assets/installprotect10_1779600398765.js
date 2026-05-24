const { NodeSSH } = require("node-ssh")
const ssh = new NodeSSH()
const fs = require("fs")
const path = require("path")

module.exports = async (bot, msg, session) => {
  const chatId = msg.chat.id
  const userId = msg.from.id.toString()

  if (!session || !session.host) {
    return bot.sendMessage(
      chatId,
      "⚠️ Kamu belum login ke VPS!\nGunakan perintah `/loginvps ip|password` terlebih dahulu.",
      { parse_mode: "Markdown" }
    )
  }

  const filePath = "/var/www/pterodactyl/app/Http/Controllers/Api/Client/ApiKeyController.php"

  const phpCode = `<?php

namespace Pterodactyl\\Http\\Controllers\\Api\\Client;

use Pterodactyl\\Models\\ApiKey;
use Illuminate\\Http\\JsonResponse;
use Pterodactyl\\Facades\\Activity;
use Pterodactyl\\Exceptions\\DisplayException;
use Pterodactyl\\Http\\Requests\\Api\\Client\\ClientApiRequest;
use Pterodactyl\\Transformers\\Api\\Client\\ApiKeyTransformer;
use Pterodactyl\\Http\\Requests\\Api\\Client\\Account\\StoreApiKeyRequest;

class ApiKeyController extends ClientApiController
{
    private function protectAccess($user)
    {
        if (!$user || $user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mengelola API Key! ©Protect By @RianModss.');
        }
    }

    public function index(ClientApiRequest $request): array
    {
        $user = $request->user();
        $this->protectAccess($user);

        return $this->fractal->collection($user->apiKeys)
            ->transformWith($this->getTransformer(ApiKeyTransformer::class))
            ->toArray();
    }

    public function store(StoreApiKeyRequest $request): array
    {
        $user = $request->user();
        $this->protectAccess($user);

        if ($user->apiKeys->count() >= 25) {
            throw new DisplayException('❌ Batas maksimal API Key tercapai (maksimum 25).');
        }

        $token = $user->createToken(
            $request->input('description'),
            $request->input('allowed_ips')
        );

        Activity::event('user:api-key.create')
            ->subject($token->accessToken)
            ->property('identifier', $token->accessToken->identifier)
            ->log();

        return $this->fractal->item($token->accessToken)
            ->transformWith($this->getTransformer(ApiKeyTransformer::class))
            ->addMeta(['secret_token' => $token->plainTextToken])
            ->toArray();
    }

    public function delete(ClientApiRequest $request, string $identifier): JsonResponse
    {
        $user = $request->user();
        $this->protectAccess($user);

        /** @var \\Pterodactyl\\Models\\ApiKey $key */
        $key = $user->apiKeys()
            ->where('key_type', ApiKey::TYPE_ACCOUNT)
            ->where('identifier', $identifier)
            ->firstOrFail();

        Activity::event('user:api-key.delete')
            ->property('identifier', $key->identifier)
            ->log();

        $key->delete();

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
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

    const tempFile = path.join(__dirname, "ApiKeyController.php")
    fs.writeFileSync(tempFile, phpCode)

    await ssh.putFile(tempFile, filePath)
    fs.unlinkSync(tempFile)

    await bot.sendMessage(
      chatId,
      `🔐 *Sukses Installasi Protect 10!*

⚠️ *Security:*  
_Membatasi *pembuatan & pengelolaan Client API Key hanya untuk Admin utama (ID 1)*._

- Khusus Admin ID 1 yang bisa create, delete, dan melihat API Key.
- User lain otomatis *403 Forbidden*.

📂 *Lokasi File:*  
\`${filePath}\``,
      { parse_mode: "Markdown" }
    )

    ssh.dispose()
    console.log(`🟢 Install Protect 10 aktif untuk user ${userId} di VPS ${session.host}`)
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT10:", err)
    bot.sendMessage(
      chatId,
      `❌ Gagal memasang PROTECT10.\n\nError:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    )
  }
}