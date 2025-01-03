import { NextResponse } from 'next/server';
import { getSavedSurveyIds, saveSurveys } from '../../../db/db';

const excludedSurveyIds = [
    'cm0l30y9q000s6v3brez8f3xt',
    'wm7mr695r9t3vikf0fi1dv9u'
];

export async function POST() {
    try {
        // Get existing survey IDs from database
        const existingIds = await getSavedSurveyIds();
        
        // Fetch all surveys from the API
        const response = await fetch('https://nps.e-koerner.com.br/api/v1/management/surveys', {
            headers: {
                'x-api-key': '02a0529c89f895215cbea487883e2d74'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching surveys: ${response.status}`);
        }

        const result = await response.json();
        const allSurveys = result.data || [];

        // Filter out excluded surveys and already saved surveys
        const newSurveys = allSurveys.filter(survey => 
            !excludedSurveyIds.includes(survey.id) && 
            !existingIds.includes(survey.id)
        );

        if (newSurveys.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: 'No new surveys to save',
                newSurveysCount: 0
            });
        }

        // Save the new surveys
        const saveResult = await saveSurveys(newSurveys);

        if (saveResult.success) {
            return NextResponse.json({ 
                success: true, 
                message: `${newSurveys.length} new surveys saved successfully`,
                newSurveysCount: newSurveys.length
            });
        } else {
            throw new Error(saveResult.error || 'Failed to save new surveys');
        }
    } catch (error) {
        console.error('Error in sync surveys:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
