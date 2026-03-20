<?php

namespace App\Console\Commands;

use App\Domain\Models\Receipt;
use App\Domain\Models\Transaction;
use Illuminate\Console\Command;

class RepairTransactions extends Command
{
    protected $signature = 'transactions:repair
                            {--user= : Only repair transactions for a specific user ID}
                            {--dry-run : Show what would be changed without applying updates}';

    protected $description = 'Sync transaction records with their linked receipt data (amount, date, description, currency)';

    public function handle(): int
    {
        $query = Transaction::whereNotNull('receipt_id')->with('receipt');

        if ($userId = $this->option('user')) {
            $query->where('user_id', $userId);
        }

        $transactions = $query->get();

        if ($transactions->isEmpty()) {
            $this->warn('No transactions with linked receipts found.');
            return 0;
        }

        $this->info("Found {$transactions->count()} transactions to check.");

        $dryRun = $this->option('dry-run');
        if ($dryRun) {
            $this->warn('DRY RUN — no changes will be applied.');
        }

        $bar = $this->output->createProgressBar($transactions->count());
        $bar->start();

        $updated = 0;
        $skipped = 0;
        $orphaned = 0;

        foreach ($transactions as $transaction) {
            $receipt = $transaction->receipt;

            if (!$receipt) {
                $orphaned++;
                $bar->advance();
                continue;
            }

            $changes = [];

            if ($receipt->total_amount !== null && (float) $transaction->amount !== (float) $receipt->total_amount) {
                $changes['amount'] = ['from' => $transaction->amount, 'to' => $receipt->total_amount];
            }

            if ($receipt->purchase_date !== null && (string) $transaction->transaction_date !== (string) $receipt->purchase_date) {
                $changes['transaction_date'] = ['from' => (string) $transaction->transaction_date, 'to' => (string) $receipt->purchase_date];
            }

            if ($receipt->merchant_name !== null && $transaction->description !== $receipt->merchant_name) {
                $changes['description'] = ['from' => $transaction->description, 'to' => $receipt->merchant_name];
            }

            if ($receipt->currency !== null && $transaction->currency !== $receipt->currency) {
                $changes['currency'] = ['from' => $transaction->currency, 'to' => $receipt->currency];
            }

            if (empty($changes)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            if ($dryRun) {
                $bar->clear();
                $this->newLine();
                $this->info("Receipt #{$receipt->id} → Transaction #{$transaction->id}:");
                foreach ($changes as $field => $diff) {
                    $this->line("  {$field}: {$diff['from']} → {$diff['to']}");
                }
                $bar->display();
            } else {
                $updateData = array_map(fn($diff) => $diff['to'], $changes);

                // Also update tax_relief_amount if amount changed and is tax deductible
                if (isset($updateData['amount']) && $transaction->is_tax_deductible && $transaction->lhdn_category_code) {
                    $updateData['tax_relief_amount'] = $updateData['amount'];
                }

                // Update tax_year if date changed
                if (isset($updateData['transaction_date'])) {
                    $updateData['tax_year'] = (int) date('Y', strtotime($updateData['transaction_date']));
                }

                $transaction->update($updateData);
            }

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $prefix = $dryRun ? 'Would update' : 'Updated';
        $this->info("{$prefix} {$updated} transactions, skipped {$skipped} (already in sync).");

        if ($orphaned > 0) {
            $this->warn("{$orphaned} transactions have a receipt_id pointing to a deleted receipt.");
        }

        return 0;
    }
}
