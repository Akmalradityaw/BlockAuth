<?php

namespace App\DataTransferObjects;

class UpdateProfileData
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly ?string $bio = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            bio: $data['bio'] ?? null,
        );
    }
}
