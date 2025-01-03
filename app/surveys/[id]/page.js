'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function SurveyDetailPage() {
  const params = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`/api/surveys/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch survey');
        }
        const data = await response.json();
        setSurvey(data.survey);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [params.id]);

  if (loading) {
    return <div className="p-8">Loading survey details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!survey) {
    return <div className="p-8">Survey not found</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">{survey.name}</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-3">
              <p><span className="font-medium">ID:</span> {survey.id}</p>
              <p><span className="font-medium">Type:</span> {survey.type}</p>
              <p><span className="font-medium">Status:</span> {survey.status}</p>
              <p><span className="font-medium">Created:</span> {new Date(survey.createdAt).toLocaleString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(survey.updatedAt).toLocaleString()}</p>
              <p><span className="font-medium">Display Option:</span> {survey.displayOption}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Recontact Days:</span> {survey.recontactDays || 'Not set'}</p>
              <p><span className="font-medium">Display Limit:</span> {survey.displayLimit || 'No limit'}</p>
              <p><span className="font-medium">Auto Close:</span> {survey.autoClose || 'Not set'}</p>
              <p><span className="font-medium">Display Percentage:</span> {survey.displayPercentage || '100%'}</p>
              <p><span className="font-medium">Email Verification:</span> {survey.isVerifyEmailEnabled ? 'Enabled' : 'Disabled'}</p>
              <p><span className="font-medium">Show Language Switch:</span> {survey.showLanguageSwitch ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {survey.questions && survey.questions.length > 0 && (
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Questions</h2>
              <div className="space-y-4">
                {survey.questions.map((question, index) => (
                  <div key={index} className="border-b pb-4">
                    <p className="font-medium">Question {index + 1}:</p>
                    <p>{question.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {survey.languages && survey.languages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Languages</h2>
              <div className="space-y-2">
                {survey.languages.map((language, index) => (
                  <p key={index}>{language}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
