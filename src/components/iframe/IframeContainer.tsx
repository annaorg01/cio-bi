
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface IframeContainerProps {
  url: string | null;
  className?: string;
}

export const IframeContainer: React.FC<IframeContainerProps> = ({ 
  url, 
  className 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (url) {
      setLoading(true);
      setError(null);
    }
  }, [url]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('שגיאה בטעינת התוכן');
  };

  if (!url) {
    return (
      <div className={cn(
        "w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200",
        className
      )}>
        <div className="text-center p-8">
          <p className="text-lg font-medium text-gray-500">בחר קישור מהתפריט</p>
          <p className="text-sm text-gray-400 mt-2">תוכן האייפריים יוצג כאן</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-full rounded-lg border border-gray-200 relative overflow-hidden",
      className
    )}>
      {loading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">טוען...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="text-center p-8">
            <p className="text-lg font-medium text-red-500">{error}</p>
            <p className="text-sm text-gray-500 mt-2">נסה שוב או בחר קישור אחר</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Embedded Content"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
};
