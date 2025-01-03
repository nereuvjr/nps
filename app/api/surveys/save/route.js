import { NextResponse } from 'next/server';
import { saveSurvey, updateSurveyProfilePicture } from '../../../db/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id, name, profilePicture } = body;

        if (!id || !name) {
            return NextResponse.json(
                { success: false, error: 'ID and name are required' },
                { status: 400 }
            );
        }

        const result = await saveSurvey(id, name, profilePicture);
        
        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error in save survey endpoint:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Endpoint to update profile picture
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, profilePicture } = body;

        if (!id || !profilePicture) {
            return NextResponse.json(
                { success: false, error: 'ID and profile picture are required' },
                { status: 400 }
            );
        }

        const result = await updateSurveyProfilePicture(id, profilePicture);
        
        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
