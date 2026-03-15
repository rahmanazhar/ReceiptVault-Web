<?php

namespace App\Policies;

use App\Domain\Models\MedicalCertificate;
use App\Domain\Models\User;

class MedicalCertificatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MedicalCertificate $medicalCertificate): bool
    {
        return $user->id === $medicalCertificate->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, MedicalCertificate $medicalCertificate): bool
    {
        return $user->id === $medicalCertificate->user_id;
    }

    public function delete(User $user, MedicalCertificate $medicalCertificate): bool
    {
        return $user->id === $medicalCertificate->user_id;
    }

    public function processOcr(User $user, MedicalCertificate $medicalCertificate): bool
    {
        return $user->id === $medicalCertificate->user_id
            && $medicalCertificate->status === 'pending';
    }
}
