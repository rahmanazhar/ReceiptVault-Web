<?php

namespace App\Policies;

use App\Domain\Models\Document;
use App\Domain\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }

    public function processOcr(User $user, Document $document): bool
    {
        return $user->id === $document->user_id
            && $document->status === 'pending';
    }
}
