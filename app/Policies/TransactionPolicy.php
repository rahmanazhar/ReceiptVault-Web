<?php

namespace App\Policies;

use App\Domain\Models\Transaction;
use App\Domain\Models\User;

class TransactionPolicy
{
    /**
     * Determine whether the user can view any transactions.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the transaction.
     */
    public function view(User $user, Transaction $transaction): bool
    {
        return $user->id === $transaction->user_id;
    }

    /**
     * Determine whether the user can create transactions.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the transaction.
     */
    public function update(User $user, Transaction $transaction): bool
    {
        return $user->id === $transaction->user_id;
    }

    /**
     * Determine whether the user can delete the transaction.
     */
    public function delete(User $user, Transaction $transaction): bool
    {
        return $user->id === $transaction->user_id;
    }

    /**
     * Determine whether the user can categorize the transaction.
     */
    public function categorize(User $user, Transaction $transaction): bool
    {
        return $user->id === $transaction->user_id;
    }

    /**
     * Determine whether the user can bulk categorize transactions.
     */
    public function bulkCategorize(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view transaction statistics.
     */
    public function viewStats(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can generate tax reports.
     */
    public function generateTaxReport(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can mark a transaction as tax deductible.
     */
    public function markTaxDeductible(User $user, Transaction $transaction): bool
    {
        return $user->id === $transaction->user_id;
    }
}
