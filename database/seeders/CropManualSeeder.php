<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CropManual;

class CropManualSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $crops = [
            [
                'name' => 'Tomatoes',
                'description' => 'Tomatoes are a popular warm-season fruit commonly grown in home gardens. They come in many varieties, sizes, and colors.',
                'image_url' => 'https://example.com/tomatoes.jpg',
                'icon' => '🍅',
                'growing_season' => 'Warm season (Spring to Fall)',
                'water_needs' => 'Moderate (1-1.5 inches per week)',
                'soil_type' => 'Well-draining, slightly acidic (pH 6.0-6.8)',
                'time_to_harvest' => '70-85 days from transplant',
                'growing_steps' => json_encode([
                    'Start seeds indoors 6-8 weeks before last frost date.',
                    'Transplant seedlings outside when nighttime temperatures are above 50°F.',
                    'Plant in full sun location with 24-36 inches between plants.',
                    'Add support structures (cage or stake) for indeterminate varieties.',
                    'Water deeply at the base, 1-2 times per week.',
                    'Apply organic mulch to retain moisture and prevent weeds.',
                    'Prune suckers for indeterminate varieties to improve air circulation.',
                    'Harvest when fruits are firm and fully colored.'
                ]),
                'dos' => json_encode([
                    'Plant deeply, burying part of the stem to develop more roots.',
                    'Rotate planting location every year to prevent disease.',
                    'Provide consistent watering to prevent blossom end rot.',
                    'Apply calcium-rich fertilizer if needed.',
                    'Check regularly for pests like hornworms and aphids.'
                ]),
                'donts' => json_encode([
                    'Avoid overhead watering to prevent fungal diseases.',
                    'Don\'t plant near walnut trees (toxic to tomatoes).',
                    'Avoid planting with potatoes, corn, or fennel.',
                    'Don\'t over-fertilize, especially with nitrogen.',
                    'Don\'t refrigerate fresh tomatoes as it affects flavor.'
                ])
            ],
            [
                'name' => 'Cabbage',
                'description' => 'Cabbage is a hardy, leafy vegetable that grows well in cool weather. It forms a dense head of tightly wrapped leaves.',
                'image_url' => 'https://example.com/cabbage.jpg',
                'icon' => '🥬',
                'growing_season' => 'Cool season (Spring and Fall)',
                'water_needs' => 'Moderate (1-1.5 inches per week)',
                'soil_type' => 'Fertile, well-draining, pH 6.5-6.8',
                'time_to_harvest' => '70-120 days from seed',
                'growing_steps' => json_encode([
                    'Start seeds indoors 4-6 weeks before last frost date.',
                    'Transplant seedlings when they have 4-5 true leaves.',
                    'Space plants 12-24 inches apart in rows 24-36 inches apart.',
                    'Plant in full sun (spring crop) or partial shade (fall crop).',
                    'Keep soil consistently moist but not waterlogged.',
                    'Apply organic mulch to retain moisture and prevent weeds.',
                    'Side-dress with balanced fertilizer when heads begin to form.',
                    'Harvest when heads are firm and reach desired size.'
                ]),
                'dos' => json_encode([
                    'Plant in soil with plenty of organic matter.',
                    'Practice crop rotation to prevent disease.',
                    'Cover young plants to protect from cabbage moths/butterflies.',
                    'Water deeply at the base to avoid wet leaves.',
                    'Harvest in the morning when it\'s cooler.'
                ]),
                'donts' => json_encode([
                    'Don\'t plant cabbage where other brassicas grew in the past 3 years.',
                    'Avoid planting near strawberries, tomatoes, or pole beans.',
                    'Don\'t let the soil dry out completely during head formation.',
                    'Avoid overhead watering to prevent disease.',
                    'Don\'t delay harvest of mature heads as they may split.'
                ])
            ],
        ];

        foreach ($crops as $crop) {
            CropManual::create($crop);
        }
    }
}