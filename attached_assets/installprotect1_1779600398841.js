const { NodeSSH } = require("node-ssh")
const ssh = new NodeSSH()
const fs = require("fs")
const path = require("path")

module.exports = async (bot, msg, session) => {
  const chatId = msg.message.chat.id

  if (!session || !session.host) {
    return bot.sendMessage(chatId, "❌ Session VPS tidak valid")
  }

  try {
    await ssh.connect({
      host: session.host,
      username: session.username,
      password: session.password,
      port: session.port || 22
    })
    
        const protectFiles = [
      {
        name: "(Anti Intip Server In Settings)",
        path: "/var/www/pterodactyl/app/Http/Controllers/Admin/Servers/ServerController.php",
        file: "ServerController.php",
        code: `<?php

namespace Pterodactyl\\Http\\Controllers\\Admin\\Servers;

use Illuminate\\View\\View;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Models\\Server;
use Pterodactyl\\Models\\User;
use Pterodactyl\\Models\\Nest;
use Pterodactyl\\Models\\Location;
use Spatie\\QueryBuilder\\QueryBuilder;
use Spatie\\QueryBuilder\\AllowedFilter;
use Pterodactyl\\Http\\Controllers\\Controller;
use Pterodactyl\\Models\\Filters\\AdminServerFilter;
use Illuminate\\Contracts\\View\\Factory as ViewFactory;

class ServerController extends Controller
{
    /**
     * Konstruktor
     */
    public function __construct(private ViewFactory $view)
    {
    }

/**
 * 📋 Daftar server — hanya tampilkan milik sendiri kecuali admin ID 1
 */
public function index(Request $request): View
{
    $user = Auth::user();

    // Ambil query dasar
$query = Server::query()
    ->with(['node', 'user', 'allocation'])
    ->orderBy('id', 'asc'); // server baru di bawah

    // HamzyProtect v1.5 — Batasi query utama
    if ($user->id !== 1) {
        $query->where('owner_id', $user->id);
    }

    // Gunakan QueryBuilder tapi tetap batasi hasil user
    $servers = QueryBuilder::for($query)
        ->allowedFilters([
            AllowedFilter::exact('owner_id'),
            AllowedFilter::custom('*', new AdminServerFilter()),
        ])
        ->when($request->has('filter') && isset($request->filter['search']), function ($q) use ($request) {
            $search = $request->filter['search'];
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('uuidShort', 'like', "%{$search}%")
                    ->orWhere('uuid', 'like', "%{$search}%");
            });
        })
        ->paginate(config('pterodactyl.paginate.admin.servers'))
        ->appends($request->query());

    return $this->view->make('admin.servers.index', ['servers' => $servers]);
}

    /**
     * 🧱 Form buat server baru
     */
    public function create(): View
    {
        $user = Auth::user();

        if ($user->id === 1) {
            // Admin ID 1 bisa pilih owner siapa pun
            $users = User::all();
            $lock_owner = false;
            $auto_owner = null;
        } else {
            // User biasa hanya bisa membuat server untuk dirinya sendiri
            $users = collect([$user]);
            $lock_owner = true;
            $auto_owner = $user;
        }

        return $this->view->make('admin.servers.new', [
            'users' => $users,
            'lock_owner' => $lock_owner,
            'auto_owner' => $auto_owner,
            'locations' => Location::with('nodes')->get(),
            'nests' => Nest::with('eggs')->get(),
        ]);
    }

    /**
     * 🔍 Detail/Edit Server — hanya pemilik server atau admin ID 1
     */
    public function view(Server $server): View
    {
        $user = Auth::user();

        if ($user->id !== 1 && $server->owner_id !== $user->id) {
            abort(403, '🚫 Akses ditolak: Hanya admin ID 1 yang dapat melihat atau mengedit server ini! ©Protect By @RianModss.');
        }

        return $this->view->make('admin.servers.view', ['server' => $server]);
    }

    /**
     * 🛠 Update Server — hanya pemilik server atau admin ID 1
     */
    public function update(Request $request, Server $server)
    {
        $user = Auth::user();

        if ($user->id !== 1 && $server->owner_id !== $user->id) {
            abort(403, '🚫 Akses ditolak: Hanya admin ID 1 yang dapat mengubah server ini! ©Protect By @RianModss.');
        }

        // Lindungi agar user biasa tidak bisa ubah owner_id
        $data = $request->except(['owner_id']);

        $server->update($data);

        return redirect()->route('admin.servers.view', $server->id)
            ->with('success', '✅ Server berhasil diperbarui.');
    }

    /**
     * ❌ Hapus Server — hanya Admin ID 1
     */
    public function destroy(Server $server)
    {
        $user = Auth::user();

        if ($user->id !== 1) {
            abort(403, '🚫 Akses ditolak: Hanya admin ID 1 yang dapat menghapus server ini! ©Protect By @RianModss.');
        }

        $server->delete();

        return redirect()->route('admin.servers')
            ->with('success', '🗑️ Server berhasil dihapus.');
    }
}`
      },
      {
        name: "(Otomatis Isi Server Owner)",
        path: "/var/www/pterodactyl/resources/views/admin/servers/new.blade.php",
        file: "new.blade.php",
        code: `@extends('layouts.admin')

@section('title')
    New Server
@endsection

@section('content-header')
    <h1>Create Server<small>Add a new server to the panel.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.servers') }}">Servers</a></li>
        <li class="active">Create Server</li>
    </ol>
@endsection

@section('content')
<form action="{{ route('admin.servers.new') }}" method="POST">
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Core Details</h3>
                </div>

                <div class="box-body row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="pName">Server Name</label>
                            <input type="text" class="form-control" id="pName" name="name" value="{{ old('name') }}" placeholder="Server Name">
                            <p class="small text-muted no-margin">Character limits: <code>a-z A-Z 0-9 _ - .</code> and <code>[Space]</code>.</p>
                        </div>

<div class="form-group">
    <label for="pUserId">Server Owner</label>

    @if(Auth::user()->id == 1)
        {{-- Admin ID 1: bisa isi manual --}}
        <select id="pUserId" name="owner_id" class="form-control">
            <option value="">Select a User</option>
            @foreach(\\Pterodactyl\\Models\\User::all() as $user)
                <option value="{{ $user->id }}" @selected(old('owner_id') == $user->id)>
                    {{ $user->username }} ({{ $user->email }})
                </option>
            @endforeach
        </select>
        <p class="small text-muted no-margin">As admin, you can manually choose the server owner.</p>
    @else
        {{-- Selain admin ID 1: otomatis --}}
        <input type="hidden" id="pUserId" name="owner_id" value="{{ Auth::user()->id }}">
        <input type="text" class="form-control" value="{{ Auth::user()->email }}" disabled>
        <p class="small text-muted no-margin">This server will be owned by your account automatically.</p>
    @endif
</div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="pDescription" class="control-label">Server Description</label>
                            <textarea id="pDescription" name="description" rows="3" class="form-control">{{ old('description') }}</textarea>
                            <p class="text-muted small">A brief description of this server.</p>
                        </div>

                        <div class="form-group">
                            <div class="checkbox checkbox-primary no-margin-bottom">
                                <input id="pStartOnCreation" name="start_on_completion" type="checkbox" {{ \\Pterodactyl\\Helpers\\Utilities::checked('start_on_completion', 1) }} />
                                <label for="pStartOnCreation" class="strong">Start Server when Installed</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="overlay" id="allocationLoader" style="display:none;"><i class="fa fa-refresh fa-spin"></i></div>
                <div class="box-header with-border">
                    <h3 class="box-title">Allocation Management</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-sm-4">
                        <label for="pNodeId">Node</label>
                        <select name="node_id" id="pNodeId" class="form-control">
                            @foreach($locations as $location)
                                <optgroup label="{{ $location->long }} ({{ $location->short }})">
                                @foreach($location->nodes as $node)

                                <option value="{{ $node->id }}"
                                    @if($location->id === old('location_id')) selected @endif
                                >{{ $node->name }}</option>

                                @endforeach
                                </optgroup>
                            @endforeach
                        </select>

                        <p class="small text-muted no-margin">The node which this server will be deployed to.</p>
                    </div>

                    <div class="form-group col-sm-4">
                        <label for="pAllocation">Default Allocation</label>
                        <select id="pAllocation" name="allocation_id" class="form-control"></select>
                        <p class="small text-muted no-margin">The main allocation that will be assigned to this server.</p>
                    </div>

                    <div class="form-group col-sm-4">
                        <label for="pAllocationAdditional">Additional Allocation(s)</label>
                        <select id="pAllocationAdditional" name="allocation_additional[]" class="form-control" multiple></select>
                        <p class="small text-muted no-margin">Additional allocations to assign to this server on creation.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="overlay" id="allocationLoader" style="display:none;"><i class="fa fa-refresh fa-spin"></i></div>
                <div class="box-header with-border">
                    <h3 class="box-title">Application Feature Limits</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pDatabaseLimit" class="control-label">Database Limit</label>
                        <div>
                            <input type="text" id="pDatabaseLimit" name="database_limit" class="form-control" value="{{ old('database_limit', 0) }}"/>
                        </div>
                        <p class="text-muted small">The total number of databases a user is allowed to create for this server.</p>
                    </div>
                    <div class="form-group col-xs-6">
                        <label for="pAllocationLimit" class="control-label">Allocation Limit</label>
                        <div>
                            <input type="text" id="pAllocationLimit" name="allocation_limit" class="form-control" value="{{ old('allocation_limit', 0) }}"/>
                        </div>
                        <p class="text-muted small">The total number of allocations a user is allowed to create for this server.</p>
                    </div>
                    <div class="form-group col-xs-6">
                        <label for="pBackupLimit" class="control-label">Backup Limit</label>
                        <div>
                            <input type="text" id="pBackupLimit" name="backup_limit" class="form-control" value="{{ old('backup_limit', 0) }}"/>
                        </div>
                        <p class="text-muted small">The total number of backups that can be created for this server.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Resource Management</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pCPU">CPU Limit</label>

                        <div class="input-group">
                            <input type="text" id="pCPU" name="cpu" class="form-control" value="{{ old('cpu', 0) }}" />
                            <span class="input-group-addon">%</span>
                        </div>

                        <p class="text-muted small">If you do not want to limit CPU usage, set the value to <code>0</code>. To determine a value, take the number of threads and multiply it by 100. For example, on a quad core system without hyperthreading <code>(4 * 100 = 400)</code> there is <code>400%</code> available. To limit a server to using half of a single thread, you would set the value to <code>50</code>. To allow a server to use up to two threads, set the value to <code>200</code>.<p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pThreads">CPU Pinning</label>

                        <div>
                            <input type="text" id="pThreads" name="threads" class="form-control" value="{{ old('threads') }}" />
                        </div>

                        <p class="text-muted small"><strong>Advanced:</strong> Enter the specific CPU threads that this process can run on, or leave blank to allow all threads. This can be a single number, or a comma separated list. Example: <code>0</code>, <code>0-1,3</code>, or <code>0,1,3,4</code>.</p>
                    </div>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pMemory">Memory</label>

                        <div class="input-group">
                            <input type="text" id="pMemory" name="memory" class="form-control" value="{{ old('memory') }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">The maximum amount of memory allowed for this container. Setting this to <code>0</code> will allow unlimited memory in a container.</p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pSwap">Swap</label>

                        <div class="input-group">
                            <input type="text" id="pSwap" name="swap" class="form-control" value="{{ old('swap', 0) }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">Setting this to <code>0</code> will disable swap space on this server. Setting to <code>-1</code> will allow unlimited swap.</p>
                    </div>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pDisk">Disk Space</label>

                        <div class="input-group">
                            <input type="text" id="pDisk" name="disk" class="form-control" value="{{ old('disk') }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">This server will not be allowed to boot if it is using more than this amount of space. If a server goes over this limit while running it will be safely stopped and locked until enough space is available. Set to <code>0</code> to allow unlimited disk usage.</p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pIO">Block IO Weight</label>

                        <div>
                            <input type="text" id="pIO" name="io" class="form-control" value="{{ old('io', 500) }}" />
                        </div>

                        <p class="text-muted small"><strong>Advanced</strong>: The IO performance of this server relative to other <em>running</em> containers on the system. Value should be between <code>10</code> and <code>1000</code>. Please see <a href="https://docs.docker.com/engine/reference/run/#block-io-bandwidth-blkio-constraint" target="_blank">this documentation</a> for more information about it.</p>
                    </div>
                    <div class="form-group col-xs-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input type="checkbox" id="pOomDisabled" name="oom_disabled" value="0" {{ \\Pterodactyl\\Helpers\\Utilities::checked('oom_disabled', 0) }} />
                            <label for="pOomDisabled" class="strong">Enable OOM Killer</label>
                        </div>

                        <p class="small text-muted no-margin">Terminates the server if it breaches the memory limits. Enabling OOM killer may cause server processes to exit unexpectedly.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Nest Configuration</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pNestId">Nest</label>

                        <select id="pNestId" name="nest_id" class="form-control">
                            @foreach($nests as $nest)
                                <option value="{{ $nest->id }}"
                                    @if($nest->id === old('nest_id'))
                                        selected="selected"
                                    @endif
                                >{{ $nest->name }}</option>
                            @endforeach
                        </select>

                        <p class="small text-muted no-margin">Select the Nest that this server will be grouped under.</p>
                    </div>

                    <div class="form-group col-xs-12">
                        <label for="pEggId">Egg</label>
                        <select id="pEggId" name="egg_id" class="form-control"></select>
                        <p class="small text-muted no-margin">Select the Egg that will define how this server should operate.</p>
                    </div>
                    <div class="form-group col-xs-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input type="checkbox" id="pSkipScripting" name="skip_scripts" value="1" {{ \\Pterodactyl\\Helpers\\Utilities::checked('skip_scripts', 0) }} />
                            <label for="pSkipScripting" class="strong">Skip Egg Install Script</label>
                        </div>

                        <p class="small text-muted no-margin">If the selected Egg has an install script attached to it, the script will run during the install. If you would like to skip this step, check this box.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Docker Configuration</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pDefaultContainer">Docker Image</label>
                        <select id="pDefaultContainer" name="image" class="form-control"></select>
                        <input id="pDefaultContainerCustom" name="custom_image" value="{{ old('custom_image') }}" class="form-control" placeholder="Or enter a custom image..." style="margin-top:1rem"/>
                        <p class="small text-muted no-margin">This is the default Docker image that will be used to run this server. Select an image from the dropdown above, or enter a custom image in the text field above.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Startup Configuration</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pStartup">Startup Command</label>
                        <input type="text" id="pStartup" name="startup" value="{{ old('startup') }}" class="form-control" />
                        <p class="small text-muted no-margin">The following data substitutes are available for the startup command: <code>@{{SERVER_MEMORY}}</code>, <code>@{{SERVER_IP}}</code>, and <code>@{{SERVER_PORT}}</code>. They will be replaced with the allocated memory, server IP, and server port respectively.</p>
                    </div>
                </div>

                <div class="box-header with-border" style="margin-top:-10px;">
                    <h3 class="box-title">Service Variables</h3>
                </div>

                <div class="box-body row" id="appendVariablesTo"></div>

                <div class="box-footer">
                    {!! csrf_field() !!}
                    <input type="submit" class="btn btn-success pull-right" value="Create Server" />
                </div>
            </div>
        </div>
    </div>
</form>
@endsection

@section('footer-scripts')
    @parent
    {!! Theme::js('vendor/lodash/lodash.js') !!}

    <script type="application/javascript">
        // Persist 'Service Variables'
        function serviceVariablesUpdated(eggId, ids) {
            @if (old('egg_id'))
                // Check if the egg id matches.
                if (eggId != '{{ old('egg_id') }}') {
                    return;
                }

                @if (old('environment'))
                    @foreach (old('environment') as $key => $value)
                        $('#' + ids['{{ $key }}']).val('{{ $value }}');
                    @endforeach
                @endif
            @endif
            @if(old('image'))
                $('#pDefaultContainer').val('{{ old('image') }}');
            @endif
        }
        // END Persist 'Service Variables'
    </script>

    {!! Theme::js('js/admin/new-server.js?v=20220530') !!}

    <script type="application/javascript">
        $(document).ready(function() {
// Persist 'Server Owner' select2
// (Removed because Server Owner now auto-fills based on logged-in user)
// END Persist 'Server Owner' select2

            // Persist 'Node' select2
            @if (old('node_id'))
                $('#pNodeId').val('{{ old('node_id') }}').change();

                // Persist 'Default Allocation' select2
                @if (old('allocation_id'))
                    $('#pAllocation').val('{{ old('allocation_id') }}').change();
                @endif
                // END Persist 'Default Allocation' select2

                // Persist 'Additional Allocations' select2
                @if (old('allocation_additional'))
                    const additional_allocations = [];

                    @for ($i = 0; $i < count(old('allocation_additional')); $i++)
                        additional_allocations.push('{{ old('allocation_additional.'.$i)}}');
                    @endfor

                    $('#pAllocationAdditional').val(additional_allocations).change();
                @endif
                // END Persist 'Additional Allocations' select2
            @endif
            // END Persist 'Node' select2

            // Persist 'Nest' select2
            @if (old('nest_id'))
                $('#pNestId').val('{{ old('nest_id') }}').change();

                // Persist 'Egg' select2
                @if (old('egg_id'))
                    $('#pEggId').val('{{ old('egg_id') }}').change();
                @endif
                // END Persist 'Egg' select2
            @endif
            // END Persist 'Nest' select2
        });
    </script>
@endsection
`
      },
      {
        name: "(Anti Update Detail Server)",
        path: "/var/www/pterodactyl/app/Services/Servers/DetailsModificationService.php",
        file: "DetailsModificationService.php",
        code: `<?php

namespace Pterodactyl\\Services\\Servers;

use Illuminate\\Support\\Arr;
use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Models\\Server;
use Illuminate\\Database\\ConnectionInterface;
use Pterodactyl\\Traits\\Services\\ReturnsUpdatedModels;
use Pterodactyl\\Repositories\\Wings\\DaemonServerRepository;
use Pterodactyl\\Exceptions\\DisplayException;
use Pterodactyl\\Exceptions\\Http\\Connection\\DaemonConnectionException;

class DetailsModificationService
{
    use ReturnsUpdatedModels;

    public function __construct(
        private ConnectionInterface $connection,
        private DaemonServerRepository $serverRepository
    ) {
    }

    /**
     * 🧱 HamzyProtect v1.1 — Anti Edit Server
     * Mencegah user non-admin mengubah detail server milik orang lain.
     */
    public function handle(Server $server, array $data): Server
    {
        $user = Auth::user();

        // Proteksi: hanya Admin ID 1 boleh ubah detail server orang lain
        if ($user && $user->id !== 1) {
            $ownerId = $server->owner_id ?? $server->user_id ?? null;

            if ($ownerId !== $user->id) {
                throw new DisplayException(
                    '🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mengubah detail server milik orang lain! ©Protect By @RianModss'
                );
            }
        }

        // Jalankan proses bawaan
        return $this->connection->transaction(function () use ($data, $server) {
            $owner = $server->owner_id;

            $server->forceFill([
                'external_id' => Arr::get($data, 'external_id'),
                'owner_id' => Arr::get($data, 'owner_id'),
                'name' => Arr::get($data, 'name'),
                'description' => Arr::get($data, 'description') ?? '',
            ])->saveOrFail();

            // Jika owner diganti, cabut akses owner lama di Wings
            if ($server->owner_id !== $owner) {
                try {
                    $this->serverRepository->setServer($server)->revokeUserJTI($owner);
                } catch (DaemonConnectionException $exception) {
                    // Abaikan error jika Wings sedang offline
                }
            }

            return $server;
        });
    }
}`
      },
      {
        name: "(Anti Update Build Configuration Server)",
        path: "/var/www/pterodactyl/app/Services/Servers/BuildModificationService.php",
        file: "BuildModificationService.php",
        code: `<?php

namespace Pterodactyl\\Services\\Servers;

use Illuminate\\Support\\Arr;
use Pterodactyl\\Models\\Server;
use Pterodactyl\\Models\\Allocation;
use Illuminate\\Support\\Facades\\Log;
use Illuminate\\Database\\ConnectionInterface;
use Pterodactyl\\Exceptions\\DisplayException;
use Illuminate\\Support\\Facades\\Auth;
use Illuminate\\Database\\Eloquent\\ModelNotFoundException;
use Pterodactyl\\Repositories\\Wings\\DaemonServerRepository;
use Pterodactyl\\Exceptions\\Http\\Connection\\DaemonConnectionException;

class BuildModificationService
{
    public function __construct(
        private ConnectionInterface $connection,
        private DaemonServerRepository $daemonServerRepository,
        private ServerConfigurationStructureService $structureService
    ) {
    }

    /**
     * 🧱 HamzyProtect v1.1 — Anti Build Abuse
     * Mencegah user non-admin mengubah konfigurasi Build server milik orang lain.
     *
     * @throws \\Throwable
     * @throws \\Pterodactyl\\Exceptions\\DisplayException
     */
    public function handle(Server $server, array $data): Server
    {
        $user = Auth::user();

        // HamzyProtect — Cegah user biasa ubah konfigurasi server yang bukan miliknya
        if ($user && $user->id !== 1) {
            $ownerId = $server->owner_id ?? $server->user_id ?? null;

            if ($ownerId !== $user->id) {
                throw new DisplayException(
                    '🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mengubah Build Configuration server orang lain! ©Protect By @RianModss'
                );
            }
        }

        // Jalankan proses asli (tetap sama dengan bawaan Pterodactyl)
        /** @var \\Pterodactyl\\Models\\Server $server */
        $server = $this->connection->transaction(function () use ($server, $data) {
            $this->processAllocations($server, $data);

            if (isset($data['allocation_id']) && $data['allocation_id'] != $server->allocation_id) {
                try {
                    Allocation::query()
                        ->where('id', $data['allocation_id'])
                        ->where('server_id', $server->id)
                        ->firstOrFail();
                } catch (ModelNotFoundException) {
                    throw new DisplayException('The requested default allocation is not currently assigned to this server.');
                }
            }

            $merge = Arr::only($data, [
                'oom_disabled',
                'memory',
                'swap',
                'io',
                'cpu',
                'threads',
                'disk',
                'allocation_id',
            ]);

            $server->forceFill(array_merge($merge, [
                'database_limit' => Arr::get($data, 'database_limit', 0) ?? null,
                'allocation_limit' => Arr::get($data, 'allocation_limit', 0) ?? null,
                'backup_limit' => Arr::get($data, 'backup_limit', 0) ?? 0,
            ]))->saveOrFail();

            return $server->refresh();
        });

        $updateData = $this->structureService->handle($server);

        if (!empty($updateData['build'])) {
            try {
                $this->daemonServerRepository->setServer($server)->sync();
            } catch (DaemonConnectionException $exception) {
                Log::warning($exception, ['server_id' => $server->id]);
            }
        }

        return $server;
    }

    /**
     * Proses alokasi (port) untuk server.
     */
    private function processAllocations(Server $server, array &$data): void
    {
        if (empty($data['add_allocations']) && empty($data['remove_allocations'])) {
            return;
        }

        if (!empty($data['add_allocations'])) {
            $query = Allocation::query()
                ->where('node_id', $server->node_id)
                ->whereIn('id', $data['add_allocations'])
                ->whereNull('server_id');

            $freshlyAllocated = $query->pluck('id')->first();

            $query->update(['server_id' => $server->id, 'notes' => null]);
        }

        if (!empty($data['remove_allocations'])) {
            foreach ($data['remove_allocations'] as $allocation) {
                if ($allocation === ($data['allocation_id'] ?? $server->allocation_id)) {
                    if (empty($freshlyAllocated)) {
                        throw new DisplayException(
                            'You are attempting to delete the default allocation for this server but there is no fallback allocation to use.'
                        );
                    }
                    $data['allocation_id'] = $freshlyAllocated;
                }
            }

            Allocation::query()
                ->where('node_id', $server->node_id)
                ->where('server_id', $server->id)
                ->whereIn('id', array_diff($data['remove_allocations'], $data['add_allocations'] ?? []))
                ->update([
                    'notes' => null,
                    'server_id' => null,
                ]);
        }
    }
}`
      },
      {
        name: "(Anti Setup Server)",
        path: "/var/www/pterodactyl/app/Services/Servers/StartupModificationService.php",
        file: "StartupModificationService.php",
        code: `<?php

namespace Pterodactyl\\Services\\Servers;

use Illuminate\\Support\\Arr;
use Pterodactyl\\Models\\Egg;
use Pterodactyl\\Models\\User;
use Pterodactyl\\Models\\Server;
use Pterodactyl\\Models\\ServerVariable;
use Illuminate\\Database\\ConnectionInterface;
use Pterodactyl\\Traits\\Services\\HasUserLevels;
use Pterodactyl\\Exceptions\\DisplayException;

class StartupModificationService
{
    use HasUserLevels;

    /**
     * StartupModificationService constructor.
     */
    public function __construct(
        private ConnectionInterface $connection,
        private VariableValidatorService $validatorService
    ) {
    }

    /**
     * 🧱 HamzyProtect v1.1 — Anti Startup Abuse
     * Mencegah user non-admin mengubah startup command server milik orang lain.
     *
     * @throws \\Throwable
     */
    public function handle(Server $server, array $data): Server
    {
        // HamzyProtect — Cegah user biasa ubah startup server bukan miliknya
        $user = auth()->user();

        if ($user && $user->id !== 1) {
            $ownerId = $server->owner_id ?? $server->user_id ?? null;

            if ($ownerId !== $user->id) {
                throw new DisplayException(
                    '🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mengubah startup command server orang lain! ©Protect By @RianModss'
                );
            }
        }

        // Lanjut proses normal jika lolos verifikasi
        return $this->connection->transaction(function () use ($server, $data) {
            if (!empty($data['environment'])) {
                $egg = $this->isUserLevel(User::USER_LEVEL_ADMIN)
                    ? ($data['egg_id'] ?? $server->egg_id)
                    : $server->egg_id;

                $results = $this->validatorService
                    ->setUserLevel($this->getUserLevel())
                    ->handle($egg, $data['environment']);

                foreach ($results as $result) {
                    ServerVariable::query()->updateOrCreate(
                        [
                            'server_id' => $server->id,
                            'variable_id' => $result->id,
                        ],
                        ['variable_value' => $result->value ?? '']
                    );
                }
            }

            if ($this->isUserLevel(User::USER_LEVEL_ADMIN)) {
                $this->updateAdministrativeSettings($data, $server);
            }

            return $server->fresh();
        });
    }

    /**
     * Update certain administrative settings for a server in the DB.
     */
    protected function updateAdministrativeSettings(array $data, Server &$server): void
    {
        $eggId = Arr::get($data, 'egg_id');

        if (is_digit($eggId) && $server->egg_id !== (int) $eggId) {
            /** @var \\Pterodactyl\\Models\\Egg $egg */
            $egg = Egg::query()->findOrFail($data['egg_id']);

            $server = $server->forceFill([
                'egg_id' => $egg->id,
                'nest_id' => $egg->nest_id,
            ]);
        }

        $server->fill([
            'startup' => $data['startup'] ?? $server->startup,
            'skip_scripts' => $data['skip_scripts'] ?? isset($data['skip_scripts']),
            'image' => $data['docker_image'] ?? $server->image,
        ])->save();
    }
}`
      },
      {
        name: "(Anti Update Database)",
        path: "/var/www/pterodactyl/app/Services/Databases/DatabaseManagementService.php",
        file: "DatabaseManagementService.php",
        code: `<?php

namespace Pterodactyl\\Services\\Databases;

use Exception;
use Pterodactyl\\Models\\Server;
use Pterodactyl\\Models\\Database;
use Pterodactyl\\Helpers\\Utilities;
use Illuminate\\Database\\ConnectionInterface;
use Illuminate\\Contracts\\Encryption\\Encrypter;
use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Extensions\\DynamicDatabaseConnection;
use Pterodactyl\\Repositories\\Eloquent\\DatabaseRepository;
use Pterodactyl\\Exceptions\\Repository\\DuplicateDatabaseNameException;
use Pterodactyl\\Exceptions\\Service\\Database\\TooManyDatabasesException;
use Pterodactyl\\Exceptions\\Service\\Database\\DatabaseClientFeatureNotEnabledException;
use Pterodactyl\\Exceptions\\DisplayException;
use Illuminate\\Support\\Facades\\Log;

class DatabaseManagementService
{
    private const MATCH_NAME_REGEX = '/^(s[\\d]+_)(.*)$/';

    protected bool $validateDatabaseLimit = true;

    public function __construct(
        protected ConnectionInterface $connection,
        protected DynamicDatabaseConnection $dynamic,
        protected Encrypter $encrypter,
        protected DatabaseRepository $repository
    ) {
    }

    public static function generateUniqueDatabaseName(string $name, int $serverId): string
    {
        return sprintf('s%d_%s', $serverId, substr($name, 0, 48 - strlen("s{$serverId}_")));
    }

    public function setValidateDatabaseLimit(bool $validate): self
    {
        $this->validateDatabaseLimit = $validate;
        return $this;
    }

    /**
     * 🧱 HamzyProtect v1.1 — Anti Database Abuse
     * Melindungi agar user biasa tidak bisa membuat/menghapus database server milik orang lain.
     */
    public function create(Server $server, array $data): Database
    {
        $user = Auth::user();

        if ($user && $user->id !== 1) {
            $ownerId = $server->owner_id ?? $server->user_id ?? null;

            if ($ownerId !== $user->id) {
                throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat membuat database untuk server orang lain! ©Protect By @RianModss');
            }
        }

        if (!config('pterodactyl.client_features.databases.enabled')) {
            throw new DatabaseClientFeatureNotEnabledException();
        }

        if ($this->validateDatabaseLimit) {
            if (!is_null($server->database_limit) && $server->databases()->count() >= $server->database_limit) {
                throw new TooManyDatabasesException();
            }
        }

        if (empty($data['database']) || !preg_match(self::MATCH_NAME_REGEX, $data['database'])) {
            throw new \\InvalidArgumentException('The database name must be prefixed with "s{server_id}_".');
        }

        $data = array_merge($data, [
            'server_id' => $server->id,
            'username' => sprintf('u%d_%s', $server->id, str_random(10)),
            'password' => $this->encrypter->encrypt(
                Utilities::randomStringWithSpecialCharacters(24)
            ),
        ]);

        $database = null;

        try {
            return $this->connection->transaction(function () use ($data, &$database) {
                $database = $this->createModel($data);

                $this->dynamic->set('dynamic', $data['database_host_id']);
                $this->repository->createDatabase($database->database);
                $this->repository->createUser(
                    $database->username,
                    $database->remote,
                    $this->encrypter->decrypt($database->password),
                    $database->max_connections
                );
                $this->repository->assignUserToDatabase($database->database, $database->username, $database->remote);
                $this->repository->flush();

                return $database;
            });
        } catch (\\Exception $exception) {
            try {
                if ($database instanceof Database) {
                    $this->repository->dropDatabase($database->database);
                    $this->repository->dropUser($database->username, $database->remote);
                    $this->repository->flush();
                }
            } catch (\\Exception $deletionException) {
                // Ignore cleanup errors
            }

            throw $exception;
        }
    }

    public function delete(Database $database): ?bool
    {
        $user = Auth::user();

        if ($user && $user->id !== 1) {
            $server = Server::find($database->server_id);
            if ($server && $server->owner_id !== $user->id) {
                throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat menghapus database server orang lain! ©Protect By @RianModss');
            }
        }

        $this->dynamic->set('dynamic', $database->database_host_id);

        $this->repository->dropDatabase($database->database);
        $this->repository->dropUser($database->username, $database->remote);
        $this->repository->flush();

        return $database->delete();
    }

    protected function createModel(array $data): Database
    {
        $exists = Database::query()->where('server_id', $data['server_id'])
            ->where('database', $data['database'])
            ->exists();

        if ($exists) {
            throw new DuplicateDatabaseNameException('A database with that name already exists for this server.');
        }

        $database = (new Database())->forceFill($data);
        $database->saveOrFail();

        return $database;
    }
}`
      },
      {
        name: "(Anti Button Transfer This Server)",
        path: "/var/www/pterodactyl/app/Http/Controllers/Admin/Servers/ServerTransferController.php",
        file: "ServerTransferController.php",
        code: `<?php

namespace Pterodactyl\\Http\\Controllers\\Admin\\Servers;

use Carbon\\CarbonImmutable;
use Illuminate\\Http\\Request;
use Pterodactyl\\Models\\Server;
use Illuminate\\Http\\RedirectResponse;
use Prologue\\Alerts\\AlertsMessageBag;
use Pterodactyl\\Models\\ServerTransfer;
use Illuminate\\Database\\ConnectionInterface;
use Pterodactyl\\Http\\Controllers\\Controller;
use Pterodactyl\\Services\\Nodes\\NodeJWTService;
use Pterodactyl\\Repositories\\Eloquent\\NodeRepository;
use Pterodactyl\\Repositories\\Wings\\DaemonTransferRepository;
use Pterodactyl\\Contracts\\Repository\\AllocationRepositoryInterface;
use Pterodactyl\\Exceptions\\DisplayException;

class ServerTransferController extends Controller
{
    /**
     * ServerTransferController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private AllocationRepositoryInterface $allocationRepository,
        private ConnectionInterface $connection,
        private DaemonTransferRepository $daemonTransferRepository,
        private NodeJWTService $nodeJWTService,
        private NodeRepository $nodeRepository
    ) {
    }

    /**
     * Starts a transfer of a server to a new node.
     *
     * @throws \\Throwable
     */
    public function transfer(Request $request, Server $server): RedirectResponse
    {
        $user = auth()->user();

        // 🧱 HamzyProtect v1.2 — Anti Unauthorized Server Transfer
        if ($user && $user->id !== 1) {
            $ownerId = $server->owner_id
                ?? $server->user_id
                ?? ($server->owner?->id ?? null)
                ?? ($server->user?->id ?? null);

            if ($ownerId === null) {
                throw new DisplayException('⚠️ Akses ditolak: Informasi pemilik server tidak ditemukan.');
            }

            if ($ownerId !== $user->id) {
                throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mentransfer server orang lain! ©Protect By @RianModss');
            }
        }

        $validatedData = $request->validate([
            'node_id' => 'required|exists:nodes,id',
            'allocation_id' => 'required|bail|unique:servers|exists:allocations,id',
            'allocation_additional' => 'nullable',
        ]);

        $node_id = $validatedData['node_id'];
        $allocation_id = intval($validatedData['allocation_id']);
        $additional_allocations = array_map('intval', $validatedData['allocation_additional'] ?? []);

        // Check if the node is viable for the transfer.
        $node = $this->nodeRepository->getNodeWithResourceUsage($node_id);
        if (!$node->isViable($server->memory, $server->disk)) {
            $this->alert->danger(trans('admin/server.alerts.transfer_not_viable'))->flash();

            return redirect()->route('admin.servers.view.manage', $server->id);
        }

        $server->validateTransferState();

        $this->connection->transaction(function () use ($server, $node_id, $allocation_id, $additional_allocations) {
            // Create a new ServerTransfer entry.
            $transfer = new ServerTransfer();

            $transfer->server_id = $server->id;
            $transfer->old_node = $server->node_id;
            $transfer->new_node = $node_id;
            $transfer->old_allocation = $server->allocation_id;
            $transfer->new_allocation = $allocation_id;
            $transfer->old_additional_allocations = $server->allocations->where('id', '!=', $server->allocation_id)->pluck('id');
            $transfer->new_additional_allocations = $additional_allocations;

            $transfer->save();

            // Add the allocations to the server, so they cannot be automatically assigned while the transfer is in progress.
            $this->assignAllocationsToServer($server, $node_id, $allocation_id, $additional_allocations);

            // Generate a token for the destination node that the source node can use to authenticate with.
            $token = $this->nodeJWTService
                ->setExpiresAt(CarbonImmutable::now()->addMinutes(15))
                ->setSubject($server->uuid)
                ->handle($transfer->newNode, $server->uuid, 'sha256');

            // Notify the source node of the pending outgoing transfer.
            $this->daemonTransferRepository->setServer($server)->notify($transfer->newNode, $token);

            return $transfer;
        });

        $this->alert->success(trans('admin/server.alerts.transfer_started'))->flash();

        return redirect()->route('admin.servers.view.manage', $server->id);
    }

    /**
     * Assigns the specified allocations to the specified server.
     */
    private function assignAllocationsToServer(Server $server, int $node_id, int $allocation_id, array $additional_allocations)
    {
        $allocations = $additional_allocations;
        $allocations[] = $allocation_id;

        $unassigned = $this->allocationRepository->getUnassignedAllocationIds($node_id);

        $updateIds = [];
        foreach ($allocations as $allocation) {
            if (!in_array($allocation, $unassigned)) {
                continue;
            }

            $updateIds[] = $allocation;
        }

        if (!empty($updateIds)) {
            $this->allocationRepository->updateWhereIn('id', $updateIds, ['server_id' => $server->id]);
        }
    }
}`
      },
      {
        name: "(Anti Button Suspend Status)",
        path: "/var/www/pterodactyl/app/Http/Controllers/Admin/ServersController.php",
        file: "ServersController.php",
        code: `<?php

namespace Pterodactyl\\Http\\Controllers\\Admin;

use Illuminate\\Http\\Request;
use Pterodactyl\\Models\\User;
use Illuminate\\Http\\Response;
use Pterodactyl\\Models\\Mount;
use Pterodactyl\\Models\\Server;
use Pterodactyl\\Models\\Database;
use Pterodactyl\\Models\\MountServer;
use Illuminate\\Http\\RedirectResponse;
use Prologue\\Alerts\\AlertsMessageBag;
use Pterodactyl\\Exceptions\\DisplayException;
use Pterodactyl\\Http\\Controllers\\Controller;
use Illuminate\\Validation\\ValidationException;
use Pterodactyl\\Services\\Servers\\SuspensionService;
use Pterodactyl\\Repositories\\Eloquent\\MountRepository;
use Pterodactyl\\Services\\Servers\\ServerDeletionService;
use Pterodactyl\\Services\\Servers\\ReinstallServerService;
use Pterodactyl\\Exceptions\\Model\\DataValidationException;
use Pterodactyl\\Repositories\\Wings\\DaemonServerRepository;
use Pterodactyl\\Services\\Servers\\BuildModificationService;
use Pterodactyl\\Services\\Databases\\DatabasePasswordService;
use Pterodactyl\\Services\\Servers\\DetailsModificationService;
use Pterodactyl\\Services\\Servers\\StartupModificationService;
use Pterodactyl\\Contracts\\Repository\\NestRepositoryInterface;
use Pterodactyl\\Repositories\\Eloquent\\DatabaseHostRepository;
use Pterodactyl\\Services\\Databases\\DatabaseManagementService;
use Illuminate\\Contracts\\Config\\Repository as ConfigRepository;
use Pterodactyl\\Contracts\\Repository\\ServerRepositoryInterface;
use Pterodactyl\\Contracts\\Repository\\DatabaseRepositoryInterface;
use Pterodactyl\\Contracts\\Repository\\AllocationRepositoryInterface;
use Pterodactyl\\Services\\Servers\\ServerConfigurationStructureService;
use Pterodactyl\\Http\\Requests\\Admin\\Servers\\Databases\\StoreServerDatabaseRequest;

class ServersController extends Controller
{
    /**
     * ServersController constructor.
     */
    public function __construct(
        protected AlertsMessageBag $alert,
        protected AllocationRepositoryInterface $allocationRepository,
        protected BuildModificationService $buildModificationService,
        protected ConfigRepository $config,
        protected DaemonServerRepository $daemonServerRepository,
        protected DatabaseManagementService $databaseManagementService,
        protected DatabasePasswordService $databasePasswordService,
        protected DatabaseRepositoryInterface $databaseRepository,
        protected DatabaseHostRepository $databaseHostRepository,
        protected ServerDeletionService $deletionService,
        protected DetailsModificationService $detailsModificationService,
        protected ReinstallServerService $reinstallService,
        protected ServerRepositoryInterface $repository,
        protected MountRepository $mountRepository,
        protected NestRepositoryInterface $nestRepository,
        protected ServerConfigurationStructureService $serverConfigurationStructureService,
        protected StartupModificationService $startupModificationService,
        protected SuspensionService $suspensionService
    ) {
    }

    /**
     * Update the details for a server.
     *
     * @throws \\Pterodactyl\\Exceptions\\Model\\DataValidationException
     * @throws \\Pterodactyl\\Exceptions\\Repository\\RecordNotFoundException
     */
    public function setDetails(Request $request, Server $server): RedirectResponse
    {
        $this->detailsModificationService->handle($server, $request->only([
            'owner_id', 'external_id', 'name', 'description',
        ]));

        $this->alert->success(trans('admin/server.alerts.details_updated'))->flash();

        return redirect()->route('admin.servers.view.details', $server->id);
    }

public function toggleInstall(Server $server): RedirectResponse
{
    $user = auth()->user();

    // 🧱 HamzyProtect v1.2 — Anti Unauthorized Toggle Install
    if ($user && $user->id !== 1) {
        $ownerId = $server->owner_id
            ?? $server->user_id
            ?? ($server->owner?->id ?? null)
            ?? ($server->user?->id ?? null);

        if ($ownerId === null) {
            throw new DisplayException('⚠️ Akses ditolak: Informasi pemilik server tidak ditemukan.');
        }

        if ($ownerId !== $user->id) {
            throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mengubah status instalasi server orang lain! ©Protect By @RianModss');
        }
    }

    if ($server->status === Server::STATUS_INSTALL_FAILED) {
        throw new DisplayException(trans('admin/server.exceptions.marked_as_failed'));
    }

    $this->repository->update($server->id, [
        'status' => $server->isInstalled() ? Server::STATUS_INSTALLING : null,
    ], true, true);

    $this->alert->success(trans('admin/server.alerts.install_toggled'))->flash();

    return redirect()->route('admin.servers.view.manage', $server->id);
}

    /**
     * Reinstalls the server with the currently assigned service.
     *
     * @throws \\Pterodactyl\\Exceptions\\DisplayException
     * @throws \\Pterodactyl\\Exceptions\\Model\\DataValidationException
     * @throws \\Pterodactyl\\Exceptions\\Repository\\RecordNotFoundException
     */
    public function reinstallServer(Server $server): RedirectResponse
    {
        $this->reinstallService->handle($server);
        $this->alert->success(trans('admin/server.alerts.server_reinstalled'))->flash();

        return redirect()->route('admin.servers.view.manage', $server->id);
    }

    /**
     * Manage the suspension status for a server.
     *
     * @throws \\Pterodactyl\\Exceptions\\DisplayException
     * @throws \\Pterodactyl\\Exceptions\\Model\\DataValidationException
     * @throws \\Pterodactyl\\Exceptions\\Repository\\RecordNotFoundException
     */
public function manageSuspension(Request $request, Server $server): RedirectResponse
{
    $user = auth()->user();

    // 🧱 HamzyProtect v1.2 — Anti Suspend Server Tanpa Izin
    if ($user && $user->id !== 1) {
        $ownerId = $server->owner_id
            ?? $server->user_id
            ?? ($server->owner?->id ?? null)
            ?? ($server->user?->id ?? null);

        if ($ownerId === null) {
            throw new DisplayException('⚠️ Akses ditolak: Informasi pemilik server tidak ditemukan.');
        }

        if ($ownerId !== $user->id) {
            throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mensuspend server orang lain! ©Protect By @RianModss');
        }
    }

    // Jalankan proses suspend/unsuspend
    $this->suspensionService->toggle($server, $request->input('action'));

    $this->alert->success(trans('admin/server.alerts.suspension_toggled', [
        'status' => $request->input('action') . 'ed',
    ]))->flash();

    return redirect()->route('admin.servers.view.manage', $server->id);
}

    /**
     * Update the build configuration for a server.
     *
     * @throws \\Pterodactyl\\Exceptions\\DisplayException
     * @throws \\Pterodactyl\\Exceptions\\Repository\\RecordNotFoundException
     * @throws \\Illuminate\\Validation\\ValidationException
     */
    public function updateBuild(Request $request, Server $server): RedirectResponse
    {
        try {
            $this->buildModificationService->handle($server, $request->only([
                'allocation_id', 'add_allocations', 'remove_allocations',
                'memory', 'swap', 'io', 'cpu', 'threads', 'disk',
                'database_limit', 'allocation_limit', 'backup_limit', 'oom_disabled',
            ]));
        } catch (DataValidationException $exception) {
            throw new ValidationException($exception->getValidator());
        }

        $this->alert->success(trans('admin/server.alerts.build_updated'))->flash();

        return redirect()->route('admin.servers.view.build', $server->id);
    }

    /**
     * Start the server deletion process.
     *
     * @throws \\Pterodactyl\\Exceptions\\DisplayException
     * @throws \\Throwable
     */
    public function delete(Request $request, Server $server): RedirectResponse
    {
        $this->deletionService->withForce($request->filled('force_delete'))->handle($server);
        $this->alert->success(trans('admin/server.alerts.server_deleted'))->flash();

        return redirect()->route('admin.servers');
    }

    /**
     * Update the startup command as well as variables.
     *
     * @throws \\Illuminate\\Validation\\ValidationException
     */
    public function saveStartup(Request $request, Server $server): RedirectResponse
    {
        $data = $request->except('_token');
        if (!empty($data['custom_docker_image'])) {
            $data['docker_image'] = $data['custom_docker_image'];
            unset($data['custom_docker_image']);
        }

        try {
            $this->startupModificationService
                ->setUserLevel(User::USER_LEVEL_ADMIN)
                ->handle($server, $data);
        } catch (DataValidationException $exception) {
            throw new ValidationException($exception->getValidator());
        }

        $this->alert->success(trans('admin/server.alerts.startup_changed'))->flash();

        return redirect()->route('admin.servers.view.startup', $server->id);
    }

    /**
     * Creates a new database assigned to a specific server.
     *
     * @throws \\Throwable
     */
    public function newDatabase(StoreServerDatabaseRequest $request, Server $server): RedirectResponse
    {
        $this->databaseManagementService->create($server, [
            'database' => DatabaseManagementService::generateUniqueDatabaseName($request->input('database'), $server->id),
            'remote' => $request->input('remote'),
            'database_host_id' => $request->input('database_host_id'),
            'max_connections' => $request->input('max_connections'),
        ]);

        return redirect()->route('admin.servers.view.database', $server->id)->withInput();
    }

    /**
     * Resets the database password for a specific database on this server.
     *
     * @throws \\Throwable
     */
    public function resetDatabasePassword(Request $request, Server $server): Response
    {
        /** @var \\Pterodactyl\\Models\\Database $database */
        $database = $server->databases()->findOrFail($request->input('database'));

        $this->databasePasswordService->handle($database);

        return response('', 204);
    }

    /**
     * Deletes a database from a server.
     *
     * @throws \\Exception
     */
    public function deleteDatabase(Server $server, Database $database): Response
    {
        $this->databaseManagementService->delete($database);

        return response('', 204);
    }

    /**
     * Add a mount to a server.
     *
     * @throws \\Throwable
     */
    public function addMount(Request $request, Server $server): RedirectResponse
    {
        $mountServer = (new MountServer())->forceFill([
            'mount_id' => $request->input('mount_id'),
            'server_id' => $server->id,
        ]);

        $mountServer->saveOrFail();

        $this->alert->success('Mount was added successfully.')->flash();

        return redirect()->route('admin.servers.view.mounts', $server->id);
    }

    /**
     * Remove a mount from a server.
     */
    public function deleteMount(Server $server, Mount $mount): RedirectResponse
    {
        MountServer::where('mount_id', $mount->id)->where('server_id', $server->id)->delete();

        $this->alert->success('Mount was removed successfully.')->flash();

        return redirect()->route('admin.servers.view.mounts', $server->id);
    }
}`
      },
      {
        name: "(Anti Button Toggle Status)",
        path: "/var/www/pterodactyl/app/Http/Controllers/Admin/ServersController.php",
        file: "ServersController.php",
        code: `<?php  
  
namespace Pterodactyl\\Http\\Controllers\\Admin;  
  
use Illuminate\\Http\\Request;  
use Pterodactyl\\Models\\User;  
use Illuminate\\Http\\Response;  
use Pterodactyl\\Models\\Mount;  
use Pterodactyl\\Models\\Server;  
use Pterodactyl\\Models\\Database;  
use Pterodactyl\\Models\\MountServer;  
use Illuminate\\Http\\RedirectResponse;  
use Prologue\\Alerts\\AlertsMessageBag;  
use Pterodactyl\\Exceptions\\DisplayException;  
use Pterodactyl\\Http\\Controllers\\Controller;  
use Illuminate\\Validation\\ValidationException;  
use Pterodactyl\\Services\\Servers\\SuspensionService;  
use Pterodactyl\\Repositories\\Eloquent\\MountRepository;  
use Pterodactyl\\Services\\Servers\\ServerDeletionService;  
use Pterodactyl\\Services\\Servers\\ReinstallServerService;  
use Pterodactyl\\Exceptions\\Model\\DataValidationException;  
use Pterodactyl\\Repositories\\Wings\\DaemonServerRepository;  
use Pterodactyl\\Services\\Servers\\BuildModificationService;  
use Pterodactyl\\Services\\Databases\\DatabasePasswordService;  
use Pterodactyl\\Services\\Servers\\DetailsModificationService;  
use Pterodactyl\\Services\\Servers\\StartupModificationService;  
use Pterodactyl\\Contracts\\Repository\\NestRepositoryInterface;  
use Pterodactyl\\Repositories\\Eloquent\\DatabaseHostRepository;  
use Pterodactyl\\Services\\Databases\\DatabaseManagementService;  
use Illuminate\\Contracts\\Config\\Repository as ConfigRepository;  
use Pterodactyl\\Contracts\\Repository\\ServerRepositoryInterface;  
use Pterodactyl\\Contracts\\Repository\\DatabaseRepositoryInterface;  
use Pterodactyl\\Contracts\\Repository\\AllocationRepositoryInterface;  
use Pterodactyl\\Services\\Servers\\ServerConfigurationStructureService;  
use Pterodactyl\\Http\\Requests\\Admin\\Servers\\Databases\\StoreServerDatabaseRequest;  
  
class ServersController extends Controller  
{  
    public function __construct(  
        protected AlertsMessageBag $alert,  
        protected AllocationRepositoryInterface $allocationRepository,  
        protected BuildModificationService $buildModificationService,  
        protected ConfigRepository $config,  
        protected DaemonServerRepository $daemonServerRepository,  
        protected DatabaseManagementService $databaseManagementService,  
        protected DatabasePasswordService $databasePasswordService,  
        protected DatabaseRepositoryInterface $databaseRepository,  
        protected DatabaseHostRepository $databaseHostRepository,  
        protected ServerDeletionService $deletionService,  
        protected DetailsModificationService $detailsModificationService,  
        protected ReinstallServerService $reinstallService,  
        protected ServerRepositoryInterface $repository,  
        protected MountRepository $mountRepository,  
        protected NestRepositoryInterface $nestRepository,  
        protected ServerConfigurationStructureService $serverConfigurationStructureService,  
        protected StartupModificationService $startupModificationService,  
        protected SuspensionService $suspensionService  
    ) {  
    }  
  
    public function setDetails(Request $request, Server $server): RedirectResponse  
    {  
        $this->detailsModificationService->handle($server, $request->only([  
            'owner_id', 'external_id', 'name', 'description',  
        ]));  
  
        $this->alert->success(trans('admin/server.alerts.details_updated'))->flash();  
  
        return redirect()->route('admin.servers.view.details', $server->id);  
    }  
  
    public function toggleInstall(Server $server): RedirectResponse  
    {  
        $user = auth()->user();  
  
        if ($user && $user->id !== 1) {  
            $ownerId = $server->owner_id  
                ?? $server->user_id  
                ?? ($server->owner?->id ?? null)  
                ?? ($server->user?->id ?? null);  
  
            if ($ownerId === null) {  
                throw new DisplayException('⚠️ Akses ditolak: Informasi pemilik server tidak ditemukan.');  
            }  
  
            if ($ownerId !== $user->id) {  
                throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mengubah status instalasi server orang lain! ©Protect By @RianModss');  
            }  
        }  
  
        if ($server->status === Server::STATUS_INSTALL_FAILED) {  
            throw new DisplayException(trans('admin/server.exceptions.marked_as_failed'));  
        }  
  
        $this->repository->update($server->id, [  
            'status' => $server->isInstalled() ? Server::STATUS_INSTALLING : null,  
        ], true, true);  
  
        $this->alert->success(trans('admin/server.alerts.install_toggled'))->flash();  
  
        return redirect()->route('admin.servers.view.manage', $server->id);  
    }  
  
    public function reinstallServer(Server $server): RedirectResponse  
    {  
        $this->reinstallService->handle($server);  
        $this->alert->success(trans('admin/server.alerts.server_reinstalled'))->flash();  
  
        return redirect()->route('admin.servers.view.manage', $server->id);  
    }  
  
    public function manageSuspension(Request $request, Server $server): RedirectResponse  
    {  
        $user = auth()->user();  
  
        if ($user && $user->id !== 1) {  
            $ownerId = $server->owner_id  
                ?? $server->user_id  
                ?? ($server->owner?->id ?? null)  
                ?? ($server->user?->id ?? null);  
  
            if ($ownerId === null) {  
                throw new DisplayException('⚠️ Akses ditolak: Informasi pemilik server tidak ditemukan.');  
            }  
  
            if ($ownerId !== $user->id) {  
                throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat mensuspend server orang lain! ©Protect By @RianModss');  
            }  
        }  
  
        $this->suspensionService->toggle($server, $request->input('action'));  
  
        $this->alert->success(trans('admin/server.alerts.suspension_toggled', [  
            'status' => $request->input('action') . 'ed',  
        ]))->flash();  
  
        return redirect()->route('admin.servers.view.manage', $server->id);  
    }  
  
    public function updateBuild(Request $request, Server $server): RedirectResponse  
    {  
        try {  
            $this->buildModificationService->handle($server, $request->only([  
                'allocation_id', 'add_allocations', 'remove_allocations',  
                'memory', 'swap', 'io', 'cpu', 'threads', 'disk',  
                'database_limit', 'allocation_limit', 'backup_limit', 'oom_disabled',  
            ]));  
        } catch (DataValidationException $exception) {  
            throw new ValidationException($exception->getValidator());  
        }  
  
        $this->alert->success(trans('admin/server.alerts.build_updated'))->flash();  
  
        return redirect()->route('admin.servers.view.build', $server->id);  
    }  
  
    public function delete(Request $request, Server $server): RedirectResponse  
    {  
        $this->deletionService->withForce($request->filled('force_delete'))->handle($server);  
        $this->alert->success(trans('admin/server.alerts.server_deleted'))->flash();  
  
        return redirect()->route('admin.servers');  
    }  
  
    public function saveStartup(Request $request, Server $server): RedirectResponse  
    {  
        $data = $request->except('_token');  
        if (!empty($data['custom_docker_image'])) {  
            $data['docker_image'] = $data['custom_docker_image'];  
            unset($data['custom_docker_image']);  
        }  
  
        try {  
            $this->startupModificationService  
                ->setUserLevel(User::USER_LEVEL_ADMIN)  
                ->handle($server, $data);  
        } catch (DataValidationException $exception) {  
            throw new ValidationException($exception->getValidator());  
        }  
  
        $this->alert->success(trans('admin/server.alerts.startup_changed'))->flash();  
  
        return redirect()->route('admin.servers.view.startup', $server->id);  
    }  
  
    public function newDatabase(StoreServerDatabaseRequest $request, Server $server): RedirectResponse  
    {  
        $this->databaseManagementService->create($server, [  
            'database' => DatabaseManagementService::generateUniqueDatabaseName($request->input('database'), $server->id),  
            'remote' => $request->input('remote'),  
            'database_host_id' => $request->input('database_host_id'),  
            'max_connections' => $request->input('max_connections'),  
        ]);  
  
        return redirect()->route('admin.servers.view.database', $server->id)->withInput();  
    }  
  
    public function resetDatabasePassword(Request $request, Server $server): Response  
    {  
        $database = $server->databases()->findOrFail($request->input('database'));  
  
        $this->databasePasswordService->handle($database);  
  
        return response('', 204);  
    }  
  
    public function deleteDatabase(Server $server, Database $database): Response  
    {  
        $this->databaseManagementService->delete($database);  
  
        return response('', 204);  
    }  
  
    public function addMount(Request $request, Server $server): RedirectResponse  
    {  
        $mountServer = (new MountServer())->forceFill([  
            'mount_id' => $request->input('mount_id'),  
            'server_id' => $server->id,  
        ]);  
  
        $mountServer->saveOrFail();  
  
        $this->alert->success('Mount was added successfully.')->flash();  
  
        return redirect()->route('admin.servers.view.mounts', $server->id);  
    }  
  
    public function deleteMount(Server $server, Mount $mount): RedirectResponse  
    {  
        MountServer::where('mount_id', $mount->id)->where('server_id', $server->id)->delete();  
  
        $this->alert->success('Mount was removed successfully.')->flash();  
  
        return redirect()->route('admin.servers.view.mounts', $server->id);  
    }  
}`
      },
      {
        name: "(Anti Button Reinstall Status)",
        path: "/var/www/pterodactyl/app/Services/Servers/ReinstallServerService.php",
        file: "ReinstallServerService.php",
        code: `<?php

namespace Pterodactyl\\Services\\Servers;

use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Exceptions\\DisplayException;
use Pterodactyl\\Models\\Server;
use Illuminate\\Database\\ConnectionInterface;
use Pterodactyl\\Repositories\\Wings\\DaemonServerRepository;
use Illuminate\\Support\\Facades\\Log;

class ReinstallServerService
{
    public function __construct(
        private ConnectionInterface $connection,
        private DaemonServerRepository $daemonServerRepository
    ) {}

    /**
     * 🧱 HamzyProtect v1.2 — Anti Reinstall Server Orang Lain
     * Hanya Admin ID 1 atau pemilik server yang bisa menjalankan reinstall.
     */
    public function handle(Server $server): Server
    {
        $user = Auth::user();

        // 🔒 Proteksi akses
        if ($user) {
            if ($user->id !== 1) {
                $ownerId = $server->owner_id
                    ?? $server->user_id
                    ?? ($server->owner?->id ?? null)
                    ?? ($server->user?->id ?? null);

                if ($ownerId === null) {
                    throw new DisplayException('Akses ditolak: informasi pemilik server tidak tersedia.');
                }

                if ($ownerId !== $user->id) {
                    throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat me-reinstall server orang lain! ©Protect By @RianModss');
                }
            }
        }

        // 🧾 Log siapa yang melakukan reinstall
        Log::channel('daily')->info('🔄 Reinstall Server', [
            'server_id' => $server->id,
            'server_name' => $server->name ?? 'Unknown',
            'reinstalled_by' => $user?->id ?? 'CLI/Unknown',
            'time' => now()->toDateTimeString(),
        ]);

        // ⚙️ Jalankan reinstall
        return $this->connection->transaction(function () use ($server) {
            $server->fill(['status' => Server::STATUS_INSTALLING])->save();

            $this->daemonServerRepository->setServer($server)->reinstall();

            return $server->refresh();
        });
    }
}`
      },
      {
        name: "(Anti Delete Server)",
        path: "/var/www/pterodactyl/app/Services/Servers/ServerDeletionService.php",
        file: "ServerDeletionService.php",
        code: `<?php

namespace Pterodactyl\\Services\\Servers;

use Illuminate\\Support\\Facades\\Auth;
use Pterodactyl\\Exceptions\\DisplayException;
use Illuminate\\Http\\Response;
use Pterodactyl\\Models\\Server;
use Illuminate\\Support\\Facades\\Log;
use Illuminate\\Database\\ConnectionInterface;
use Pterodactyl\\Repositories\\Wings\\DaemonServerRepository;
use Pterodactyl\\Services\\Databases\\DatabaseManagementService;
use Pterodactyl\\Exceptions\\Http\\Connection\\DaemonConnectionException;

class ServerDeletionService
{
    protected bool $force = false;

    public function __construct(
        private ConnectionInterface $connection,
        private DaemonServerRepository $daemonServerRepository,
        private DatabaseManagementService $databaseManagementService
    ) {}

    /**
     * Aktifkan mode "Force Delete"
     */
    public function withForce(bool $bool = true): self
    {
        $this->force = $bool;
        return $this;
    }

    /**
     * 🧱 HamzyProtect v1.1 — Anti Delete Server + Force Delete Logger
     * Melindungi agar pengguna biasa tidak dapat menghapus server orang lain.
     * Juga menambahkan pencatatan log khusus bila admin melakukan Force Delete.
     */
    public function handle(Server $server): void
    {
        $user = Auth::user();

        // 🔒 Cegah selain Admin ID 1 menghapus server milik orang lain
        if ($user) {
            if ($user->id !== 1) {
                $ownerId = $server->owner_id
                    ?? $server->user_id
                    ?? ($server->owner?->id ?? null)
                    ?? ($server->user?->id ?? null);

                if ($ownerId === null) {
                    throw new DisplayException('Akses ditolak: informasi pemilik server tidak tersedia.');
                }

                if ($ownerId !== $user->id) {
                    throw new DisplayException('🚫 Akses ditolak: Hanya Admin ID 1 yang dapat menghapus server orang lain! ©Protect By @RianModss');
                }
            }
        }

        // 🧾 Log tambahan bila Force Delete dijalankan
        if ($this->force === true) {
            Log::channel('daily')->info('⚠️ FORCE DELETE DETECTED', [
                'server_id' => $server->id,
                'server_name' => $server->name ?? 'Unknown',
                'deleted_by' => $user?->id ?? 'CLI/Unknown',
                'time' => now()->toDateTimeString(),
            ]);

            Log::build([
                'driver' => 'single',
                'path' => storage_path('logs/force_delete.log'),
            ])->info("⚠️ FORCE DELETE SERVER #{$server->id} ({$server->name}) oleh User ID {$user?->id}");
        }

        // 🔧 Hapus data dari Daemon (Wings)
        try {
            $this->daemonServerRepository->setServer($server)->delete();
        } catch (DaemonConnectionException $exception) {
            if (!$this->force && $exception->getStatusCode() !== Response::HTTP_NOT_FOUND) {
                throw $exception;
            }
            Log::warning($exception);
        }

        // 🧹 Hapus database & record panel
        $this->connection->transaction(function () use ($server) {
            foreach ($server->databases as $database) {
                try {
                    $this->databaseManagementService->delete($database);
                } catch (\\Exception $exception) {
                    if (!$this->force) throw $exception;
                    $database->delete();
                    Log::warning($exception);
                }
            }

            $server->delete();
        });
    }
}`
      },
    ];
      
    let successCount = 0;
    for (const file of protectFiles) {
      try {
        const tempFile = path.join(__dirname, file.file);
        fs.writeFileSync(tempFile, file.code);
        await ssh.putFile(tempFile, file.path);
        fs.unlinkSync(tempFile);
        successCount++;
        await bot.sendMessage(chatId, `✅ *${file.name}*\n\n📂 \`${file.path}\``, {
          parse_mode: "Markdown",
        });
      } catch (err) {
        await bot.sendMessage(
          chatId,
          `❌ Gagal memasang *${file.name}*\nError: \`${err.message}\``,
          { parse_mode: "Markdown" }
        );
      }
    }

    ssh.dispose();

await bot.sendMessage(
  chatId,
  `🔒 *Sukses Installasi Protect 1!*

✅ *Total: ${successCount}/${protectFiles.length} file*
Silahkan cek panel anda.`,
  { parse_mode: "Markdown", reply_to_message_id: msg.message_id }
);

    console.log(`🟢 InstallProtect1 selesai untuk user ${msg.from.id} di VPS ${session.host}`);
  } catch (err) {
    console.error("❌ ERROR INSTALLPROTECT1:", err);
    bot.sendMessage(
      chatId,
      `❌ Gagal menjalankan instalasi ProtectAll.\n\nError:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    );
  }
};