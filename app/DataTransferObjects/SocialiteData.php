<?php

namespace App\DataTransferObjects;

class SocialiteData
{
    public function __construct(
        public readonly string $provider,
        public readonly string $providerId,
        public readonly string $name,
        public readonly string $email,
        public readonly ?string $token = null,
        public readonly ?string $avatar = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            provider: $data['provider'],
            providerId: $data['provider_id'],
            name: $data['name'],
            email: $data['email'],
            token: $data['token'] ?? null,
            avatar: $data['avatar'] ?? null,
        );
    }
}
