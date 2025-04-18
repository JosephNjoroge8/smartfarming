<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\User;

class BlogPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some blog categories first (only if they don't exist)
        $categories = [
            ['name' => 'Crop Farming', 'slug' => 'crop-farming', 'description' => 'Articles about crop cultivation and management'],
            ['name' => 'Sustainable Farming', 'slug' => 'sustainable-farming', 'description' => 'Eco-friendly and sustainable agricultural practices'],
            ['name' => 'Pest Management', 'slug' => 'pest-management', 'description' => 'Dealing with pests and diseases in farming'],
            ['name' => 'Farm Technology', 'slug' => 'farm-technology', 'description' => 'Modern technology applications in agriculture']
        ];

        $categoryIds = [];
        foreach ($categories as $categoryData) {
            // Use firstOrCreate to avoid duplicate entries
            $category = BlogCategory::firstOrCreate(
                ['slug' => $categoryData['slug']], // Find by this attribute
                $categoryData // Create with these attributes if not found
            );
            $categoryIds[$categoryData['slug']] = $category->id;
        }

        // Get the first user (or a specific user) instead of looking for an admin
        $user = User::first(); // Use the first available user instead
        
        if (!$user) {
            // If no user exists, create one
            $user = User::factory()->create([
                'name' => 'Blog Author',
                'email' => 'author@example.com',
            ]);
        }

        // Create blog posts
        $posts = [
            [
                'title' => 'Top 5 Irrigation Methods for Small-Scale Farmers',
                'excerpt' => 'Discover the most effective and water-efficient irrigation techniques suitable for small farms.',
                'content' => '<p>Water is a precious resource in agriculture, and choosing the right irrigation method can make a significant difference in crop yields and resource conservation.</p><h2>1. Drip Irrigation</h2><p>Drip irrigation delivers water directly to the plant\'s root zone through tubes with small holes or emitters. This method is highly efficient with up to 90% water usage efficiency.</p><h2>2. Sprinkler Systems</h2><p>Sprinklers are versatile and can be used for most crops. They simulate rainfall and are particularly useful for germination and cooling crops in hot weather.</p><h2>3. Furrow Irrigation</h2><p>This traditional method involves creating small parallel channels alongside crop rows to distribute water. It\'s simple to implement but requires proper land grading.</p><h2>4. Wicking Beds</h2><p>Wicking beds use capillary action to draw water up from a reservoir below the soil. They\'re excellent for water conservation and work well in raised beds.</p><h2>5. Rainwater Harvesting</h2><p>Collecting rainwater for irrigation reduces dependency on groundwater and can be integrated with other irrigation methods for a sustainable approach.</p><p>Each method has its advantages and is suited to different crops, soils, and climates. Consider your specific farming conditions when choosing the best irrigation solution for your farm.</p>',
                'image_url' => 'https://example.com/irrigation-methods.jpg',
                'status' => 'published',
                'featured' => true,
                'read_time' => 8,
                'categories' => ['crop-farming', 'sustainable-farming']
            ],
            [
                'title' => 'Natural Pest Control Strategies That Actually Work',
                'excerpt' => 'Learn effective organic methods to manage pests without harmful chemicals.',
                'content' => '<p>Chemical pesticides can be harmful to beneficial insects, soil health, and human health. Here are proven natural alternatives that can help you manage pests effectively.</p><h2>Companion Planting</h2><p>Certain plants naturally repel specific pests or attract beneficial insects. For example, marigolds deter nematodes, while basil repels mosquitoes and flies.</p><h2>Beneficial Insects</h2><p>Ladybugs, praying mantises, and lacewings are natural predators that can help control aphids, mites, and other harmful insects.</p><h2>Neem Oil</h2><p>This natural oil disrupts the life cycle of pests and acts as both a repellent and insecticide for a wide range of common garden pests.</p><h2>Diatomaceous Earth</h2><p>This powder is harmless to humans but lethal to insects with exoskeletons. It works by dehydrating pests when they crawl over it.</p><h2>Crop Rotation</h2><p>Changing where you plant different crops each season helps break pest cycles by eliminating their continuous food source.</p><p>By combining these methods in an integrated pest management approach, you can maintain a healthy balance in your garden ecosystem while keeping pest damage to a minimum.</p>',
                'image_url' => 'https://example.com/natural-pest-control.jpg',
                'status' => 'published',
                'featured' => false,
                'read_time' => 6,
                'categories' => ['pest-management']
            ],
        ];

        // Check if posts already exist to avoid duplicates
        foreach ($posts as $postData) {
            // Extract categories
            $postCategories = $postData['categories'];
            unset($postData['categories']);
            
            // Check if this post already exists by title
            $existingPost = BlogPost::where('title', $postData['title'])->first();
            
            if (!$existingPost) {
                // Create new post
                $postData['user_id'] = $user->id;
                $post = BlogPost::create($postData);
                
                // Attach categories using their IDs
                $categoriesToAttach = [];
                foreach ($postCategories as $slug) {
                    if (isset($categoryIds[$slug])) {
                        $categoriesToAttach[] = $categoryIds[$slug];
                    }
                }
                
                if (!empty($categoriesToAttach)) {
                    $post->categories()->attach($categoriesToAttach);
                }
            }
        }
    }
}