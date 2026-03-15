<?php

namespace App\Events;

use App\Domain\Models\MedicalCertificate;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MedicalCertificateProcessed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public MedicalCertificate $medicalCertificate,
    ) {}
}
