<?php

namespace App\DataTransferObjects\Settings;

class OAuthProviderData
{
    public function __construct(
        public readonly string $providerId,
        public readonly string $name,
        public readonly string $driver,
        public readonly string $clientId,
        public readonly ?string $clientSecret = null,
        public readonly bool $isActive = true,
    ) {
    }

    public static function fromArray(array $data, ?string $providerId = null): self
    {
        return new self(
            providerId: $providerId ?? $data['provider_id'] ?? '',
            name: $data['name'] ?? '',
            driver: $data['driver'] ?? 'google',
            clientId: $data['client_id'] ?? '',
            clientSecret: $data['client_secret'] ?? null,
            isActive: (bool) ($data['is_active'] ?? false),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->providerId,
            'name' => $this->name,
            'driver' => $this->driver,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'is_active' => $this->isActive,
        ];
    }
}

