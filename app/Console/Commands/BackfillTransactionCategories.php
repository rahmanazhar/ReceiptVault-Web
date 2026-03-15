<?php

namespace App\Console\Commands;

use App\Domain\Models\Category;
use App\Domain\Models\Transaction;
use Illuminate\Console\Command;

class BackfillTransactionCategories extends Command
{
    protected $signature = 'transactions:backfill-categories
                            {--user= : Only backfill for a specific user ID}';

    protected $description = 'Assign categories to existing transactions using receipt metadata (no AI re-processing needed)';

    public function handle(): int
    {
        $query = Transaction::whereNull('category_id')
            ->whereNotNull('receipt_id')
            ->with('receipt');

        if ($userId = $this->option('user')) {
            $query->where('user_id', $userId);
        }

        $transactions = $query->get();

        if ($transactions->isEmpty()) {
            $this->info('No uncategorized transactions with receipts found.');
            return 0;
        }

        $this->info("Found {$transactions->count()} uncategorized transactions to backfill.");

        $bar = $this->output->createProgressBar($transactions->count());
        $bar->start();

        $updated = 0;
        $skipped = 0;

        foreach ($transactions as $transaction) {
            $metadata = $transaction->receipt->metadata ?? null;
            $categoryName = $metadata['category'] ?? null;

            if (!$categoryName) {
                $skipped++;
                $bar->advance();
                continue;
            }

            $categoryName = ucfirst($categoryName);
            $category = Category::firstOrCreate(
                ['user_id' => $transaction->user_id, 'name' => $categoryName],
                ['is_system' => false],
            );

            $transaction->update(['category_id' => $category->id]);
            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Done! {$updated} categorized, {$skipped} skipped (no metadata).");

        return 0;
    }
}
