<?php

namespace App\Support;

class TwoFactorAuthenticator
{
    private const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /**
     * Buat secret key acak Base32 (panjang default 32 karakter).
     */
    public static function generateSecretKey(int $length = 32): string
    {
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= self::BASE32_CHARS[random_int(0, 31)];
        }
        return $secret;
    }

    /**
     * Buat URL otpauth:// untuk pemindaian aplikasi Authenticator.
     */
    public static function getOtpAuthUrl(string $company, string $email, string $secret): string
    {
        $label = rawurlencode($company) . ':' . rawurlencode($email);
        $issuer = rawurlencode($company);

        return "otpauth://totp/{$label}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";
    }

    /**
     * Buat URL gambar QR Code untuk mempermudah scan di aplikasi authenticator.
     */
    public static function getQrCodeImageUrl(string $company, string $email, string $secret): string
    {
        $otpUrl = self::getOtpAuthUrl($company, $email, $secret);
        return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=' . rawurlencode($otpUrl);
    }

    /**
     * Verifikasi kode 6 digit TOTP berdasarkan secret key.
     */
    public static function verifyCode(string $secret, string $code, int $window = 1): bool
    {
        $code = trim($code);
        if (strlen($code) !== 6 || ! ctype_digit($code)) {
            return false;
        }

        $currentTimeSlice = (int) floor(time() / 30);

        for ($i = -$window; $i <= $window; $i++) {
            $calculated = self::calculateCode($secret, $currentTimeSlice + $i);
            if (hash_equals($calculated, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Hitung kode 6 digit TOTP untuk slice waktu tertentu (RFC 6238).
     */
    public static function calculateCode(string $secret, int $timeSlice): string
    {
        $binarySecret = self::base32Decode($secret);

        // Pack 64-bit integer (big endian)
        $timePacked = pack('N*', 0) . pack('N*', $timeSlice);

        // Hash HMAC-SHA1
        $hash = hash_hmac('sha1', $timePacked, $binarySecret, true);

        // Dynamic truncation
        $offset = ord($hash[19]) & 0x0F;
        $binaryCode = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        );

        $otp = $binaryCode % 1000000;

        return str_pad((string) $otp, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Decode string Base32 menjadi raw binary.
     */
    private static function base32Decode(string $b32): string
    {
        $b32 = strtoupper(trim($b32));
        $buffer = 0;
        $bufferLength = 0;
        $binary = '';

        for ($i = 0; $i < strlen($b32); $i++) {
            $char = $b32[$i];
            $charPos = strpos(self::BASE32_CHARS, $char);

            if ($charPos === false) {
                continue;
            }

            $buffer = ($buffer << 5) | $charPos;
            $bufferLength += 5;

            if ($bufferLength >= 8) {
                $bufferLength -= 8;
                $binary .= chr(($buffer >> $bufferLength) & 0xFF);
            }
        }

        return $binary;
    }

    /**
     * Buat daftar kode pemulihan darurat (Emergency Recovery Codes).
     */
    public static function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $part1 = bin2hex(random_bytes(2));
            $part2 = bin2hex(random_bytes(2));
            $codes[] = strtoupper("{$part1}-{$part2}");
        }

        return $codes;
    }
}
