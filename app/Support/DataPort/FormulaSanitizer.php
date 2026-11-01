<?php

namespace App\Support\DataPort;

class FormulaSanitizer
{
    /**
     * Karakter berbahaya pemicu eksekusi rumus di Excel/Spreadsheet.
     */
    protected static array $dangerousPrefixes = ['=', '+', '-', '@', "\t", "\r"];

    /**
     * Netralkan nilai teks agar tidak dieksekusi sebagai rumus spreadsheet.
     */
    public static function sanitize(mixed $value): mixed
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        $firstChar = substr($value, 0, 1);

        if (in_array($firstChar, self::$dangerousPrefixes, true)) {
            return "'" . $value;
        }

        return $value;
    }

    /**
     * Sanitasi satu baris data array.
     */
    public static function sanitizeRow(array $row): array
    {
        return array_map([self::class, 'sanitize'], $row);
    }
}

