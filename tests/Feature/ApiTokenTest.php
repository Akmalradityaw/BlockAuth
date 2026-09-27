<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_personal_access_token(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/profile/tokens', [
            'name' => 'CI Deployment Token',
            'abilities' => ['read', 'write'],
        ]);

        $response->assertSessionHas('new_token');
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'CI Deployment Token',
        ]);
    }

    public function test_user_can_revoke_personal_access_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('Temporary Token', ['read']);

        $response = $this->actingAs($user)->delete("/profile/tokens/{$token->accessToken->id}");

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }
}
