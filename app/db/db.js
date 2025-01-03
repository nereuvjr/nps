import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Initialize the database
async function openDb() {
    return open({
        filename: path.join(process.cwd(), 'app/db/surveys.db'),
        driver: sqlite3.Database
    });
}

// Create the surveys table if it doesn't exist
async function initializeDb() {
    const db = await openDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS surveys (
            id TEXT PRIMARY KEY UNIQUE,
            name TEXT NOT NULL,
            profile_picture TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(id)
        )
    `);
    return db;
}

// Save a survey
async function saveSurvey(id, name, profilePicture = null) {
    const db = await initializeDb();
    try {
        // Check if survey already exists
        const existingSurvey = await db.get('SELECT id FROM surveys WHERE id = ?', [id]);
        if (existingSurvey) {
            return { success: false, error: 'Survey with this ID already exists' };
        }

        await db.run(
            'INSERT INTO surveys (id, name, profile_picture) VALUES (?, ?, ?)',
            [id, name, profilePicture]
        );
        return { success: true };
    } catch (error) {
        console.error('Error saving survey:', error);
        return { success: false, error: error.message };
    } finally {
        await db.close();
    }
}

// Update a survey
async function updateSurvey(id, name, profilePicture = null) {
    const db = await initializeDb();
    try {
        const result = await db.run(
            'UPDATE surveys SET name = ?, profile_picture = ? WHERE id = ?',
            [name, profilePicture, id]
        );
        return { success: result.changes > 0 };
    } catch (error) {
        console.error('Error updating survey:', error);
        return { success: false, error: error.message };
    } finally {
        await db.close();
    }
}

// Delete a survey
async function deleteSurvey(id) {
    const db = await initializeDb();
    try {
        const result = await db.run('DELETE FROM surveys WHERE id = ?', [id]);
        return { success: result.changes > 0 };
    } catch (error) {
        console.error('Error deleting survey:', error);
        return { success: false, error: error.message };
    } finally {
        await db.close();
    }
}

// Get a single survey
async function getSurvey(id) {
    const db = await initializeDb();
    try {
        const survey = await db.get('SELECT * FROM surveys WHERE id = ?', [id]);
        return survey;
    } catch (error) {
        console.error('Error getting survey:', error);
        return null;
    } finally {
        await db.close();
    }
}

// Get all saved surveys
async function getSavedSurveys() {
    const db = await initializeDb();
    try {
        const surveys = await db.all('SELECT * FROM surveys ORDER BY created_at DESC');
        return surveys;
    } catch (error) {
        console.error('Error getting surveys:', error);
        return [];
    } finally {
        await db.close();
    }
}

// Update a survey's profile picture
async function updateSurveyProfilePicture(id, profilePicture) {
    const db = await initializeDb();
    try {
        const result = await db.run(
            'UPDATE surveys SET profile_picture = ? WHERE id = ?',
            [profilePicture, id]
        );
        return { success: result.changes > 0 };
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return { success: false, error: error.message };
    } finally {
        await db.close();
    }
}

// Get all saved survey IDs
async function getSavedSurveyIds() {
    const db = await initializeDb();
    try {
        const surveys = await db.all('SELECT id FROM surveys');
        return surveys.map(survey => survey.id);
    } catch (error) {
        console.error('Error getting survey IDs:', error);
        return [];
    } finally {
        await db.close();
    }
}

// Save multiple surveys at once
async function saveSurveys(surveys) {
    const db = await initializeDb();
    try {
        await db.run('BEGIN TRANSACTION');
        
        for (const survey of surveys) {
            await db.run(
                'INSERT INTO surveys (id, name, profile_picture) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING',
                [survey.id, survey.name, survey.profilePicture]
            );
        }
        
        await db.run('COMMIT');
        return { success: true };
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error saving surveys:', error);
        return { success: false, error: error.message };
    } finally {
        await db.close();
    }
}

export { 
    saveSurvey, 
    getSavedSurveys, 
    updateSurveyProfilePicture,
    updateSurvey,
    deleteSurvey,
    getSurvey,
    getSavedSurveyIds,
    saveSurveys
};
