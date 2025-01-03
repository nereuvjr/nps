import { NextResponse } from 'next/server';
import { getSavedSurveys, deleteSurvey, updateSurvey, getSurvey } from '../../db/db';

// Get all saved surveys
export async function GET() {
    try {
        const surveys = await getSavedSurveys();
        return NextResponse.json({ surveys });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Update a survey
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, name, profilePicture } = body;

        if (!id || !name) {
            return NextResponse.json(
                { success: false, error: 'ID and name are required' },
                { status: 400 }
            );
        }

        const result = await updateSurvey(id, name, profilePicture);
        
        if (result.success) {
            const updatedSurvey = await getSurvey(id);
            return NextResponse.json({ success: true, survey: updatedSurvey });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Delete a survey
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        const result = await deleteSurvey(id);
        
        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: 'Survey not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
