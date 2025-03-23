<?php

namespace App\Policies;

use App\Domain\Models\Receipt;
use App\Domain\Models\User;

class ReceiptPolicy
{
    /**
     * Determine whether the user can view any receipts.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the receipt.
     */
    public function view(User $user, Receipt $receipt): bool
    {
        return $user->id === $receipt->user_id;
    }

    /**
     * Determine whether the user can create receipts.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the receipt.
     */
    public function update(User $user, Receipt $receipt): bool
    {
        return $user->id === $receipt->user_id;
    }

    /**
     * Determine whether the user can delete the receipt.
     */
    public function delete(User $user, Receipt $receipt): bool
    {
        return $user->id === $receipt->user_id;
    }

    /**
     * Determine whether the user can process OCR for the receipt.
     */
    public function processOcr(User $user, Receipt $receipt): bool
    {
        return $user->id === $receipt->user_id 
            && $receipt->status === 'pending';
    }

    /**
     * Determine whether the user can view transactions for the receipt.
     */
    public function viewTransactions(User $user, Receipt $receipt): bool
    {
        return $user->id === $receipt->user_id;
    }
}
