<?php

namespace App\Support;

class AgentParser
{
    public static function parse(?string $userAgent): array
    {
        if (empty($userAgent)) {
            return [
                'platform' => 'Tidak Diketahui',
                'browser' => 'Browser Tidak Dikenal',
                'device_type' => 'desktop',
            ];
        }

        // Deteksi Platform / OS
        $platform = 'Tidak Diketahui';
        if (preg_match('/windows|win32/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
        } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            $platform = 'iOS';
        } elseif (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
        }

        // Deteksi Device Type
        $deviceType = 'desktop';
        if (preg_match('/tablet|ipad/i', $userAgent)) {
            $deviceType = 'tablet';
        } elseif (preg_match('/mobile|android|iphone|ipod/i', $userAgent)) {
            $deviceType = 'mobile';
        }

        // Deteksi Browser
        $browser = 'Browser Tidak Dikenal';
        if (preg_match('/edg/i', $userAgent)) {
            $browser = 'Microsoft Edge';
        } elseif (preg_match('/opr|opera/i', $userAgent)) {
            $browser = 'Opera';
        } elseif (preg_match('/chrome|crios/i', $userAgent)) {
            $browser = 'Google Chrome';
        } elseif (preg_match('/firefox|fxios/i', $userAgent)) {
            $browser = 'Mozilla Firefox';
        } elseif (preg_match('/safari/i', $userAgent)) {
            $browser = 'Apple Safari';
        }

        return [
            'platform' => $platform,
            'browser' => $browser,
            'device_type' => $deviceType,
        ];
    }
}
