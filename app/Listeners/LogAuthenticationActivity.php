<?php

namespace App\Listeners;

use App\Models\AuthenticationLog;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

class LogAuthenticationActivity
{
    public function handle(object $event): void
    {
        $request = request();
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        if ($event instanceof Login) {
            AuthenticationLog::create([
                'tenant_id'  => $event->user->tenant_id,
                'user_id'    => $event->user->id,
                'email'      => $event->user->email,
                'event'      => 'login_success',
                'ip_address' => $ip,
                'user_agent' => $userAgent,
            ]);
        } elseif ($event instanceof Failed) {
            AuthenticationLog::create([
                'tenant_id'  => $event->user?->tenant_id,
                'user_id'    => $event->user?->id,
                'email'      => $request->input('email', 'unknown'),
                'event'      => 'login_failed',
                'ip_address' => $ip,
                'user_agent' => $userAgent,
            ]);
        } elseif ($event instanceof Logout) {
            if ($event->user) {
                AuthenticationLog::create([
                    'tenant_id'  => $event->user->tenant_id,
                    'user_id'    => $event->user->id,
                    'email'      => $event->user->email,
                    'event'      => 'logout',
                    'ip_address' => $ip,
                    'user_agent' => $userAgent,
                ]);
            }
        }
    }
}