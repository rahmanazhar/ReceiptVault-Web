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
                'metadata' => [
                    'qualifying_items' => [
                        'Automatic relief for every individual taxpayer',
                        'No receipt or proof of expenditure required',
                    ],
                ],
            ],
            [
                'code' => 'MEDICAL_SELF',
                'name' => 'Medical Expenses (Self/Spouse/Child)',
                'description' => 'Medical treatment for serious diseases, fertility treatment, vaccination, dental, and mental health examination or consultation.',
                'annual_limit' => 10000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Serious disease treatment (cancer, kidney failure, leukaemia, heart disease, AIDS, Parkinson\'s, etc.)',
                        'Fertility treatment for self or spouse',
                        'Vaccination expenses for self, spouse, and child (sub-limit RM1,000)',
                        'Dental examination and treatment (sub-limit RM1,000)',
                        'Complete medical examination (sub-limit RM1,000)',
                        'Mental health examination or consultation by registered psychiatrist/psychologist',
                        'Learning disability assessment for child aged 2-18',
                        'Early intervention or rehabilitation treatment for child aged 2-18',
                    ],
                ],
            ],
            [
                'code' => 'MEDICAL_EXAM',
                'name' => 'Complete Medical Examination',
                'description' => 'Complete medical examination for self, spouse, or child. Sub-limit within medical expenses.',
                'annual_limit' => 1000.00,
                'parent_code' => 'MEDICAL_SELF',
                'metadata' => [
                    'qualifying_items' => [
                        'Full body medical check-up at registered medical facility',
                        'Includes self, spouse, or child',
                    ],
                ],
            ],
            [
                'code' => 'MEDICAL_DENTAL',
                'name' => 'Dental Examination & Treatment',
                'description' => 'Dental examination and treatment expenses. Sub-limit within medical expenses.',
                'annual_limit' => 1000.00,
                'parent_code' => 'MEDICAL_SELF',
                'metadata' => [
                    'qualifying_items' => [
                        'Dental check-ups and examinations',
                        'Dental treatment (fillings, extractions, root canal, etc.)',
                        'Does not include cosmetic dental procedures',
                    ],
                ],
            ],
            [
                'code' => 'MEDICAL_VACCINE',
                'name' => 'Vaccination Expenses',
                'description' => 'Vaccination expenses for self, spouse, and child. Sub-limit within medical expenses.',
                'annual_limit' => 1000.00,
                'parent_code' => 'MEDICAL_SELF',
                'metadata' => [
                    'qualifying_items' => [
                        'Pneumococcal vaccination',
                        'Human Papillomavirus (HPV) vaccination',
                        'Influenza vaccination',
                        'Rotavirus vaccination',
                        'Any other vaccination administered by registered medical practitioner',
                    ],
                ],
            ],
            [
                'code' => 'MEDICAL_PARENTS',
                'name' => 'Medical Treatment for Parents',
                'description' => 'Medical treatment, dental, special needs, and carer expenses for parents. Extended to grandparents from YA 2025.',
                'annual_limit' => 8000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Medical treatment for parents (extended to grandparents from YA 2025)',
                        'Dental treatment for parents',
                        'Carer expenses for parents',
                        'Nursing home care certified by registered medical practitioner',
                        'Special needs and home-based care expenses',
                        'Vaccination for parents (sub-limit RM1,000)',
                    ],
                ],
            ],
            [
                'code' => 'DISABLED_INDIVIDUAL',
                'name' => 'Disabled Individual',
                'description' => 'Additional relief for individual registered as disabled person with JKM (Department of Social Welfare).',
                'annual_limit' => 6000.00,
                'year_overrides' => [
                    2025 => ['annual_limit' => 7000.00],
                    2026 => ['annual_limit' => 7000.00],
                ],
                'metadata' => [
                    'qualifying_items' => [
                        'Must be registered as Orang Kurang Upaya (OKU) with JKM',
                        'Valid disability card (Kad OKU) required',
                        'Additional to basic individual relief of RM9,000',
                    ],
                ],
            ],
            [
                'code' => 'DISABLED_SPOUSE',
                'name' => 'Disabled Spouse',
                'description' => 'Additional relief for disabled spouse.',
                'annual_limit' => 5000.00,
                'year_overrides' => [
                    2025 => ['annual_limit' => 6000.00],
                    2026 => ['annual_limit' => 6000.00],
                ],
                'metadata' => [
                    'qualifying_items' => [
                        'Spouse must be registered as OKU with JKM',
                        'Must live together with spouse',
                        'Additional to spouse relief of RM4,000',
                    ],
                ],
            ],
            [
                'code' => 'EDUCATION_SELF',
                'name' => 'Education Fees (Self)',
                'description' => 'Fees for courses at recognized institutions: Masters, Doctorate, or upskilling/self-enhancement courses.',
                'annual_limit' => 7000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Masters or Doctorate degree at recognized institution',
                        'Courses in law, accounting, Islamic finance, technical, vocational, industrial, scientific or technology fields',
                        'Any upskilling or self-enhancement course recognized by MQA or Ministry of Finance',
                        'Up to RM2,000 sub-limit for upskilling/self-enhancement courses',
                    ],
                ],
            ],
            [
                'code' => 'LIFESTYLE',
                'name' => 'Lifestyle Expenses',
                'description' => 'Books, journals, personal computer, smartphone, tablet, internet subscription for personal use.',
                'annual_limit' => 2500.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Books, journals, magazines, printed newspapers, and similar publications',
                        'Personal computer, smartphone, or tablet (not for business use)',
                        'Internet subscription (personal use)',
                        'Does not include extended warranty or accessories',
                    ],
                ],
            ],
            [
                'code' => 'LIFESTYLE_SPORT',
                'name' => 'Sports & Physical Activity',
                'description' => 'Purchase of sports equipment, gym membership, registration fees for sports competitions. Additional relief separate from lifestyle.',
                'annual_limit' => 1000.00,
                'parent_code' => 'LIFESTYLE',
                'metadata' => [
                    'qualifying_items' => [
                        'Sports equipment (rackets, balls, shoes, etc.)',
                        'Gym or fitness centre membership',
                        'Registration fees for sports competitions organized by licensed bodies',
                        'Rental or entrance fees for sports facilities',
                        'Sports training fees',
                    ],
                ],
            ],
            [
                'code' => 'BREASTFEEDING',
                'name' => 'Breastfeeding Equipment',
                'description' => 'Purchase of breastfeeding equipment for own use. Claimable once every 2 years for child aged 2 and below.',
                'annual_limit' => 1000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Breast pump (manual or electric)',
                        'Ice packs and cooler bags for breast milk storage',
                        'Breast milk collection and storage equipment',
                        'Claimable once every 2 assessment years',
                        'For female resident taxpayers only',
                        'Child must be aged 2 years and below',
                    ],
                ],
            ],
            [
                'code' => 'CHILDCARE',
                'name' => 'Child Care Fees',
                'description' => 'Fees paid to registered child care centre or kindergarten for child aged 6 and below.',
                'annual_limit' => 3000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Fees for registered child care centre (taska)',
                        'Fees for registered kindergarten (tadika)',
                        'Child must be aged 6 years and below',
                        'Centre must be registered with relevant authority',
                        'Claimable by parent who incurred the expense (not both parents for same child)',
                    ],
                ],
            ],
            [
                'code' => 'SSPN',
                'name' => 'SSPN Net Deposit',
                'description' => 'Net deposit in Skim Simpanan Pendidikan Nasional (National Education Savings Scheme).',
                'annual_limit' => 8000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Net deposits in SSPN-i or SSPN-i Plus account',
                        'Net deposit = Total deposit minus total withdrawal in the year',
                        'Either parent can claim (not both for same account)',
                        'Extended through YA 2027',
                    ],
                ],
            ],
            [
                'code' => 'SPOUSE',
                'name' => 'Spouse / Alimony',
                'description' => 'Relief for spouse with no income or electing joint assessment, or alimony payments to former wife.',
                'annual_limit' => 4000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Spouse with no income or total income elected for joint assessment',
                        'Alimony payments to former wife (under a formal agreement)',
                        'Spouse earning more than RM4,000 from foreign sources is not eligible',
                    ],
                ],
            ],
            [
                'code' => 'CHILD',
                'name' => 'Child (Under 18)',
                'description' => 'Relief for each unmarried child under 18 years of age.',
                'annual_limit' => 2000.00,
                'metadata' => [
                    'per_child' => true,
                    'qualifying_items' => [
                        'Each unmarried child under 18 years old',
                        'Includes legally adopted children',
                        'Includes stepchildren under care of taxpayer',
                    ],
                ],
            ],
            [
                'code' => 'CHILD_EDUCATION',
                'name' => 'Child (18+ in Higher Education)',
                'description' => 'Relief for each unmarried child aged 18+ receiving full-time education at diploma level and above.',
                'annual_limit' => 8000.00,
                'metadata' => [
                    'per_child' => true,
                    'qualifying_items' => [
                        'Unmarried child aged 18 and above',
                        'Full-time education at diploma level or above in Malaysia',
                        'Full-time education at degree level or above outside Malaysia',
                        'Institution must be recognized by relevant government authority',
                        'RM2,000 for A-Level, certificate, matriculation, or preparatory courses',
                    ],
                ],
            ],
            [
                'code' => 'DISABLED_CHILD',
                'name' => 'Disabled Child',
                'description' => 'Additional relief for each unmarried disabled child.',
                'annual_limit' => 6000.00,
                'year_overrides' => [
                    2025 => ['annual_limit' => 8000.00],
                    2026 => ['annual_limit' => 8000.00],
                ],
                'metadata' => [
                    'per_child' => true,
                    'qualifying_items' => [
                        'Each unmarried disabled child registered with JKM',
                        'Additional RM8,000 if receiving diploma/degree education (YA 2025+)',
                        'Additional to normal child relief',
                    ],
                ],
            ],
            [
                'code' => 'LIFE_INSURANCE_EPF',
                'name' => 'Life Insurance & EPF',
                'description' => 'Life insurance premiums and EPF (KWSP)/approved scheme contributions. Combined limit.',
                'annual_limit' => 7000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Life insurance premiums (max RM3,000 for private sector employees)',
                        'EPF (KWSP) mandatory contributions (max RM4,000)',
                        'Approved provident fund or scheme contributions',
                        'Takaful contributions (life/family)',
                        'Combined total capped at RM7,000',
                    ],
                ],
            ],
            [
                'code' => 'EDUCATION_MEDICAL_INSURANCE',
                'name' => 'Education & Medical Insurance',
                'description' => 'Insurance premiums for education or medical benefits for self, spouse, or child.',
                'annual_limit' => 3000.00,
                'year_overrides' => [
                    2025 => ['annual_limit' => 4000.00],
                    2026 => ['annual_limit' => 4000.00],
                ],
                'metadata' => [
                    'qualifying_items' => [
                        'Medical insurance premiums for self, spouse, or child',
                        'Education insurance premiums',
                        'Takaful contributions (medical/education)',
                        'Includes co-payment medical insurance',
                    ],
                ],
            ],
            [
                'code' => 'SOCSO',
                'name' => 'SOCSO / EIS Contribution',
                'description' => 'Social Security Organisation (SOCSO) and Employment Insurance System (EIS) contributions.',
                'annual_limit' => 350.00,
                'metadata' => [
                    'qualifying_items' => [
                        'SOCSO (PERKESO) employee contributions',
                        'Employment Insurance System (EIS/SIP) contributions',
                        'Statutory deductions from salary',
                    ],
                ],
            ],
            [
                'code' => 'PRIVATE_RETIREMENT',
                'name' => 'Private Retirement Scheme',
                'description' => 'Contributions to approved Private Retirement Scheme (PRS) and deferred annuity.',
                'annual_limit' => 3000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Contributions to approved PRS providers',
                        'Deferred annuity scheme premiums',
                        'Extended through YA 2030',
                    ],
                ],
            ],
            [
                'code' => 'DOMESTIC_TRAVEL',
                'name' => 'Domestic Travel Expenses',
                'description' => 'Expenses on domestic tourism: accommodation at registered premises, entrance fees to tourist attractions.',
                'annual_limit' => 1000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Accommodation at premises registered with MOTAC (Ministry of Tourism)',
                        'Entrance fees to tourist attractions',
                        'Purchase of domestic tour packages from licensed travel agents',
                    ],
                ],
            ],
            [
                'code' => 'EV_CHARGING',
                'name' => 'EV Charging Facility',
                'description' => 'Purchase, installation, rental, hire purchase or subscription of EV charging facility. YA 2024-2027.',
                'annual_limit' => 2500.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Purchase of EV charging equipment',
                        'Installation cost for EV charging facility',
                        'Rental of EV charging equipment',
                        'Hire purchase of EV charging facility',
                        'Subscription fees for EV charging services',
                        'Available from YA 2024 to YA 2027',
                    ],
                ],
            ],
            [
                'code' => 'DISABLED_EQUIPMENT',
                'name' => 'Supporting Equipment (Disabled)',
                'description' => 'Purchase of supporting equipment for disabled self, spouse, child, or parent.',
                'annual_limit' => 6000.00,
                'metadata' => [
                    'qualifying_items' => [
                        'Assistive devices and equipment for disabled person',
                        'For disabled self, spouse, child, or parent',
                        'Includes wheelchairs, hearing aids, prosthetics, etc.',
                        'Person must be registered as OKU with JKM',
                    ],
                ],
            ],
            [
                'code' => 'PARENT_SUPPORT',
                'name' => 'Parent Support',
                'description' => 'Relief for maintenance of parents aged 60 and above with annual income not exceeding RM24,000.',
                'annual_limit' => 1500.00,
                'metadata' => [
                    'per_parent' => true,
                    'qualifying_items' => [
                        'RM1,500 per parent (mother and/or father)',
                        'Parent must be aged 60 years and above',
                        'Parent\'s annual income must not exceed RM24,000',
                        'Parent must be a resident in Malaysia',
                        'Can be claimed by multiple children sharing the support',
                    ],
                ],
            ],
            [
                'code' => 'HOUSING_LOAN',
                'name' => 'Housing Loan Interest',
                'description' => 'Interest on housing loan for first residential property. Available from YA 2025.',
                'annual_limit' => 7000.00,
                'is_active' => false,
                'year_overrides' => [
                    2025 => ['is_active' => true],
                    2026 => ['is_active' => true],
                ],
                'metadata' => [
                    'qualifying_items' => [
                        'Interest paid on housing loan for first residential property',
                        'RM7,000 for property priced RM500,000 and below',
                        'RM5,000 for property priced RM500,001 to RM750,000',
                        'Sale and purchase agreement signed from 2025 onwards',
                        'First-time homebuyer only',
                        'Available from YA 2025 to YA 2027',
                    ],
                    'tiers' => [
                        ['max_property_value' => 500000, 'limit' => 7000],
                        ['max_property_value' => 750000, 'limit' => 5000],
                    ],
                ],
            ],
            [
                'code' => 'ZAKAT',
                'name' => 'Zakat / Fitrah',
                'description' => 'Zakat and fitrah payments. Deducted directly from tax payable (rebate), not subject to a cap.',
                'annual_limit' => 0.00,
                'metadata' => [
                    'deduction_type' => 'tax_rebate',
                    'qualifying_items' => [
                        'Zakat on income (zakat pendapatan)',
                        'Zakat on savings (zakat simpanan)',
                        'Zakat fitrah',
                        'Must be paid to authorized religious authorities (Majlis Agama)',
                        'Deducted from tax payable, not from total income',
                        'No maximum limit - offset against tax amount',
                    ],
                ],
            ],
        ];

        foreach ($taxYears as $year) {
            foreach ($categories as $category) {
                $data = [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'annual_limit' => $category['annual_limit'],
                    'parent_code' => $category['parent_code'] ?? null,
                    'is_active' => $category['is_active'] ?? true,
                    'metadata' => $category['metadata'] ?? null,
                ];

                // Apply year-specific overrides
                if (isset($category['year_overrides'][$year])) {
                    $data = array_merge($data, $category['year_overrides'][$year]);
                }

                LhdnTaxRelief::updateOrCreate(
                    [
                        'code' => $category['code'],
                        'tax_year' => $year,
                    ],
                    $data
                );
            }
        }
    }
}
