<?php

namespace Database\Seeders;

use App\Domain\Models\LhdnTaxRelief;
use Illuminate\Database\Seeder;

class LhdnTaxReliefSeeder extends Seeder
{
    public function run(): void
    {
        $taxYears = [2024, 2025, 2026];

        $categories = [
            [
                'code' => 'INDIVIDUAL',
                'name' => 'Individual & Dependent Relatives',
                'description' => 'Automatic individual tax relief for self and dependent relatives.',
                'annual_limit' => 9000.00,
            ],
            [
                'code' => 'MEDICAL_SELF',
                'name' => 'Medical Expenses (Self/Spouse/Child)',
                'description' => 'Medical treatment for serious diseases, fertility treatment, vaccination, dental (limited). Includes mental health examination.',
                'annual_limit' => 10000.00,
            ],
            [
                'code' => 'MEDICAL_EXAM',
                'name' => 'Complete Medical Examination',
                'description' => 'Complete medical examination for self, spouse, or child. Sub-limit within medical expenses.',
                'annual_limit' => 1000.00,
                'parent_code' => 'MEDICAL_SELF',
            ],
            [
                'code' => 'MEDICAL_PARENTS',
                'name' => 'Medical Treatment for Parents',
                'description' => 'Medical treatment, special needs, and carer expenses for parents.',
                'annual_limit' => 8000.00,
            ],
            [
                'code' => 'DISABLED_INDIVIDUAL',
                'name' => 'Disabled Individual',
                'description' => 'Additional relief for individual registered as disabled person.',
                'annual_limit' => 6000.00,
            ],
            [
                'code' => 'DISABLED_SPOUSE',
                'name' => 'Disabled Spouse',
                'description' => 'Additional relief for disabled spouse.',
                'annual_limit' => 5000.00,
            ],
            [
                'code' => 'EDUCATION_SELF',
                'name' => 'Education Fees (Self)',
                'description' => 'Fees for courses at recognized institutions: Masters, Doctorate, or upskilling/self-enhancement courses in law, accounting, finance, etc.',
                'annual_limit' => 7000.00,
            ],
            [
                'code' => 'LIFESTYLE',
                'name' => 'Lifestyle Expenses',
                'description' => 'Books, journals, magazines, printed newspapers, personal computer, smartphone, tablet, internet subscription, sports equipment.',
                'annual_limit' => 2500.00,
            ],
            [
                'code' => 'LIFESTYLE_SPORT',
                'name' => 'Sports & Physical Activity',
                'description' => 'Purchase of sports equipment, gym membership, registration fees for sports competitions. Sub-limit within lifestyle.',
                'annual_limit' => 1000.00,
                'parent_code' => 'LIFESTYLE',
            ],
            [
                'code' => 'BREASTFEEDING',
                'name' => 'Breastfeeding Equipment',
                'description' => 'Purchase of breastfeeding equipment for own use. Claimable once every 2 years.',
                'annual_limit' => 1000.00,
            ],
            [
                'code' => 'CHILDCARE',
                'name' => 'Child Care Fees',
                'description' => 'Fees paid to registered child care centre/kindergarten for child aged 6 and below.',
                'annual_limit' => 3000.00,
            ],
            [
                'code' => 'SSPN',
                'name' => 'SSPN Net Deposit',
                'description' => 'Net deposit in Skim Simpanan Pendidikan Nasional (National Education Savings Scheme).',
                'annual_limit' => 8000.00,
            ],
            [
                'code' => 'SPOUSE',
                'name' => 'Spouse / Alimony',
                'description' => 'Relief for spouse with no income or electing joint assessment, or alimony payments to former wife.',
                'annual_limit' => 4000.00,
            ],
            [
                'code' => 'CHILD',
                'name' => 'Child (Under 18)',
                'description' => 'Relief for each unmarried child under 18 years of age.',
                'annual_limit' => 2000.00,
                'metadata' => ['per_child' => true],
            ],
            [
                'code' => 'CHILD_EDUCATION',
                'name' => 'Child (18+ in Higher Education)',
                'description' => 'Relief for each unmarried child aged 18+ receiving full-time education at diploma level and above.',
                'annual_limit' => 8000.00,
                'metadata' => ['per_child' => true],
            ],
            [
                'code' => 'DISABLED_CHILD',
                'name' => 'Disabled Child',
                'description' => 'Additional relief for each disabled child.',
                'annual_limit' => 6000.00,
                'metadata' => ['per_child' => true],
            ],
            [
                'code' => 'LIFE_INSURANCE_EPF',
                'name' => 'Life Insurance & EPF',
                'description' => 'Life insurance premiums and EPF/approved scheme contributions.',
                'annual_limit' => 7000.00,
            ],
            [
                'code' => 'EDUCATION_MEDICAL_INSURANCE',
                'name' => 'Education & Medical Insurance',
                'description' => 'Insurance premiums for education or medical benefits for self, spouse, or child.',
                'annual_limit' => 3000.00,
            ],
            [
                'code' => 'SOCSO',
                'name' => 'SOCSO / EIS Contribution',
                'description' => 'Social Security Organisation (SOCSO) and Employment Insurance System (EIS) contributions.',
                'annual_limit' => 350.00,
            ],
            [
                'code' => 'PRIVATE_RETIREMENT',
                'name' => 'Private Retirement Scheme',
                'description' => 'Contributions to approved Private Retirement Scheme (PRS) and deferred annuity.',
                'annual_limit' => 3000.00,
            ],
            [
                'code' => 'DOMESTIC_TRAVEL',
                'name' => 'Domestic Travel Expenses',
                'description' => 'Expenses on domestic tourism: accommodation at registered premises, entrance fees to tourist attractions.',
                'annual_limit' => 1000.00,
            ],
            [
                'code' => 'EV_CHARGING',
                'name' => 'EV Charging Facility',
                'description' => 'Purchase, installation, rental, hire purchase or subscription of EV charging facility.',
                'annual_limit' => 2500.00,
            ],
            [
                'code' => 'DISABLED_EQUIPMENT',
                'name' => 'Supporting Equipment (Disabled)',
                'description' => 'Purchase of supporting equipment for disabled self, spouse, child, or parent.',
                'annual_limit' => 6000.00,
            ],
        ];

        foreach ($taxYears as $year) {
            foreach ($categories as $category) {
                LhdnTaxRelief::updateOrCreate(
                    [
                        'code' => $category['code'],
                        'tax_year' => $year,
                    ],
                    [
                        'name' => $category['name'],
                        'description' => $category['description'],
                        'annual_limit' => $category['annual_limit'],
                        'parent_code' => $category['parent_code'] ?? null,
                        'is_active' => true,
                        'metadata' => $category['metadata'] ?? null,
                    ]
                );
            }
        }
    }
}
