<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DiseaseDetectionController extends Controller
{
    /**
     * Analyze an uploaded plant image for disease detection
     */
    public function analyze(Request $request)
    {
        // Validate request
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        try {
            // Get the uploaded file
            $image = $request->file('image');
            
            // Generate a unique filename
            $filename = 'plant-' . Str::uuid() . '.' . $image->getClientOriginalExtension();
            
            // Store the file
            $path = Storage::disk('public')->putFileAs('disease-detection', $image, $filename);
            
            // Get full URL for the stored image
            $imageUrl = asset('storage/' . $path);
            
            // Here you would call your AI model API with the image
            // This is a placeholder for the AI model integration
            // $aiResponse = Http::attach('image', file_get_contents($image), $filename)
            //                  ->post('https://your-ai-model-endpoint.com/predict');
            
            // For demo purposes, we'll simulate an AI response
            $simulatedResults = $this->getSimulatedResult($image);
            
            // Save the analysis result to database if needed
            // ...
            
            return response()->json(array_merge(
                $simulatedResults,
                ['image_url' => $imageUrl]
            ));
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error analyzing image: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Analyze an uploaded plant image for disease detection using external API
     */
    public function analyzeImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB max
        ]);
        
        // Store the uploaded image
        $imagePath = $request->file('image')->store('disease-analysis', 'public');
        
        try {
            // Example integration with a plant disease API
            // Replace with actual API integration
            $client = new \GuzzleHttp\Client();
            $response = $client->post(env('PLANT_DISEASE_API_URL', 'https://api.example.com/analyze'), [
                'multipart' => [
                    [
                        'name' => 'file',
                        'contents' => fopen(storage_path('app/public/' . $imagePath), 'r')
                    ]
                ]
            ]);
            
            $analysisResult = json_decode($response->getBody(), true);
            // Store the result in database
            $detection = new \App\Models\DiseaseDetection();
            $detection->user_id = Auth::check() ? Auth::id() : null;
            $detection->image_path = $imagePath;
            $detection->image_path = $imagePath;
            $detection->disease_name = $analysisResult['disease'] ?? 'Unknown';
            $detection->confidence = $analysisResult['confidence'] ?? '0%';
            $detection->recommendations = $analysisResult['recommendations'] ?? 'No recommendations available';
            $detection->save();
            
            return response()->json($analysisResult);
        } catch (\Exception $e) {
            Log::error('Disease detection error: ' . $e->getMessage());
            
            // Fall back to mock data for demo purposes
            return response()->json([
                'disease' => 'Analysis Failed',
                'confidence' => '0%',
                'recommendations' => 'Please try again with a clearer image.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Simulates AI model prediction for demo purposes
     * In a real application, this would be replaced with actual API calls to a model
     */
    private function getSimulatedResult($image)
    {
        // In a real application, this would be an actual call to your ML model
        
        // Generate random disease or healthy condition for demo
        $conditions = [
            [
                'healthy' => true,
                'disease' => 'Healthy',
                'confidence' => rand(85, 99),
                'description' => 'Your plant appears to be healthy. No signs of disease or pest damage detected.',
                'recommendations' => [],
                'preventiveMeasures' => [
                    'Continue regular watering and fertilization schedule',
                    'Monitor for any changes in leaf color or texture',
                    'Ensure adequate sunlight and ventilation',
                    'Apply preventive organic pesticides if in high-risk areas'
                ]
            ],
            [
                'healthy' => false,
                'disease' => 'Early Blight',
                'confidence' => rand(75, 95),
                'description' => 'Early blight is a fungal disease caused by Alternaria solani. It appears as dark brown spots with concentric rings on lower, older leaves first.',
                'recommendations' => [
                    'Remove and destroy affected leaves immediately',
                    'Apply copper-based fungicide as directed',
                    'Avoid overhead watering to reduce leaf wetness',
                    'Improve air circulation around plants'
                ],
                'preventiveMeasures' => [
                    'Use disease-resistant varieties when planting',
                    'Practice crop rotation (3-4 year cycle)',
                    'Mulch around base of plants to prevent soil splash',
                    'Ensure proper plant spacing for good air circulation'
                ]
            ],
            [
                'healthy' => false,
                'disease' => 'Powdery Mildew',
                'confidence' => rand(80, 98),
                'description' => 'Powdery mildew is a fungal disease that appears as white powdery spots on leaves, stems and sometimes fruit. It can affect plant growth and yield.',
                'recommendations' => [
                    'Apply neem oil or potassium bicarbonate spray',
                    'Remove heavily infected plant parts',
                    'Increase air circulation around plants',
                    'Apply sulfur-based fungicide for severe cases'
                ],
                'preventiveMeasures' => [
                    'Plant resistant varieties when possible',
                    'Avoid overhead watering and water early in the day',
                    'Space plants properly for good air circulation',
                    'Clean garden tools between use on different plants'
                ]
            ],
            [
                'healthy' => false,
                'disease' => 'Aphid Infestation',
                'confidence' => rand(70, 90),
                'description' => 'Aphids are small sap-sucking insects that can cause stunted growth, leaf curl, and spread plant diseases. They often appear on new growth and the undersides of leaves.',
                'recommendations' => [
                    'Spray plants with strong water stream to dislodge aphids',
                    'Apply insecticidal soap or neem oil',
                    'Introduce beneficial insects like ladybugs',
                    'For severe infestations, consider organic or synthetic insecticides'
                ],
                'preventiveMeasures' => [
                    'Regularly inspect plants, especially new growth',
                    'Encourage beneficial insects in your garden',
                    'Avoid excessive nitrogen fertilization which attracts aphids',
                    'Remove severely infested plants to prevent spread'
                ]
            ]
        ];
        
        // Return a random condition for demo purposes
        return $conditions[array_rand($conditions)];
    }
}