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

  const filePath = "/var/www/pterodactyl/app/Http/Controllers/Api/Client/TwoFactorController.php"

  const phpCode = `<?php

namespace Pterodactyl\\Http\\Controllers\\Api\\Client;

use Carbon\\Carbon;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Response;
use Illuminate\\Http\\JsonResponse;
use Pterodactyl\\Facades\\Activity;
use Pterodactyl\\Services\\Users\\TwoFactorSetupService;
use Pterodactyl\\Services\\Users\\ToggleTwoFactorService;
use Illuminate\\Contracts\\Validation\\Factory as ValidationFactory;
use Symfony\\Component\\HttpKernel\\Exception\\BadRequestHttpException;

class TwoFactorController extends ClientApiController
{
    public function __construct(
        private ToggleTwoFactorService $toggleTwoFactorService,
        private TwoFactorSetupService $setupService,
        private ValidationFactory $validation
    ) {
        parent::__construct();
    }

    public function index(Request $request): JsonResponse
    {
        if ($request->user()->id !== 1) {
            abort(403, '🚫 Kasihan gabisa yaaa? 😹 Hanya Admin utama (ID 1) yang dapat mengatur Two-Step Verification. ©Protect By @RianModss');
        }

        if ($request->user()->use_totp) {
            throw new BadRequestHttpException('Two-factor authentication is already enabled on this account.');
        }

        return new JsonResponse([
            'data' => $this->setupService->handle($request->user()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->id !== 1) {
            abort(403, '🚫 Kasihan gabisa yaaa? 😹 Hanya Admin utama (ID 1) yang dapat mengaktifkan Two-Step Verification. ©Protect By @RianModss');
        }

        $validator = $this->validation->make($request->all(), [
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string'],
        ]);

        $data = $validator->validate();
        if (!password_verify($data['password'], $request->user()->password)) {
            throw new BadRequestHttpException('The password provided was not valid.');
        }

        $tokens = $this->toggleTwoFactorService->handle($request->user(), $data['code'], true);
        Activity::event('user:two-factor.create')->log();

        return new JsonResponse([
            'object' => 'recovery_tokens',
            'attributes' => ['tokens' => $tokens],
        ]);
    }

    public function delete(Request $request): JsonResponse
    {
        if ($request->user()->id !== 1) {
            abort(403, '🚫 Kasihan gabisa yaaa? 😹 Hanya Admin utama (ID 1) yang dapat menonaktifkan Two-Step Verification. ©Protect By @RianModss');
        }

        if (!password_verify($request->input('password') ?? '', $request->user()->password)) {
            throw new BadRequestHttpException('The password provided was not valid.');
        }

        $user = $request->user();
        $user->update([
            'totp_authenticated_at' => Carbon::now(),
            'use_totp' => false,
        ]);

        Activity::event('user:two-factor.delete')->log();

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
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

    const tempFile = path.join(__dirname, "TwoFactorController.php")
    fs.writeFileSync(tempFile, phpCode)

    await ssh.putFile(tempFile, filePath)
    fs.unlinkSync(tempFile)

    await bot.sendMessage(
      chatId,
      `🔐 *Sukses Installasi Protect 13!*

⚠️ *Security:*  
_Menutup akses Two Step Verification untuk semua user selain Admin utama (ID 1)._

- Khusus Admin ID 1 dapat enable / disable 2FA.
- User lain otomatis *403 Akses Ditolak*.

📂 *Lokasi File:*  
\`${filePath}\``,
      { parse_mode: "Markdown" }
    )

    ssh.dispose()
    console.log(`🟢 Install Protect 13 aktif untuk user ${userId} di VPS ${session.host}`)
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT13:", err)
    bot.sendMessage(
      chatId,
      `❌ Gagal memasang PROTECT13.\n\nError:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    )
  }
}