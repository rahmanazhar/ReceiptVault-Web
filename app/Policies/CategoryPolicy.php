<?php

namespace App\Policies;

use App\Domain\Models\Category;
use App\Domain\Models\User;

class CategoryPolicy
{
    /**
     * Determine whether the user can view any categories.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the category.
     */
    public function view(User $user, Category $category): bool
    {
        return $category->is_system || $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can create categories.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the category.
     */
    public function update(User $user, Category $category): bool
    {
        // Users cannot modify system categories
        if ($category->is_system) {
            return false;
        }

        return $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can delete the category.
     */
    public function delete(User $user, Category $category): bool
    {
        // System categories cannot be deleted
        if ($category->is_system) {
            return false;
        }

        return $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can view transactions for the category.
     */
    public function viewTransactions(User $user, Category $category): bool
    {
        return $category->is_system || $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can view statistics for the category.
     */
    public function viewStats(User $user, Category $category): bool
    {
        return $category->is_system || $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can merge this category with another.
     */
    public function merge(User $user, Category $category): bool
    {
        // System categories cannot be merged
        if ($category->is_system) {
            return false;
        }

        return $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can view monthly spending for the category.
     */
    public function viewMonthlySpending(User $user, Category $category): bool
    {
        return $category->is_system || $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can view most used categories.
     */
    public function viewMostUsed(User $user): bool
    {
        return true;
    }
}
