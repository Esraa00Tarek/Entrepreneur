import React, { useState } from 'react';
import { FileText, Eye, Download, Trash2 } from 'lucide-react';

const mockDocuments = [
  {
    group: 'Pitch Decks',
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    files: [
      {
        name: 'TechStart Pitch Deck Q4 2024.pdf',
        type: 'PDF',
        size: '2.4 MB',
        uploaded: '2 days ago',
        company: 'TechStart Inc.',
        icon: <FileText className="w-5 h-5 text-red-500" />
      },
      {
        name: 'GreenTech Solutions Investor Presentation.pdf',
        type: 'PDF',
        size: '5.1 MB',
        uploaded: '5 days ago',
        company: 'GreenTech Solutions',
        icon: <FileText className="w-5 h-5 text-red-500" />
      },
      {
        name: 'AIBot Funding Deck.pptx',
        type: 'PPTX',
        size: '8.7 MB',
        uploaded: '1 week ago',
        company: 'AIBot Technologies',
        icon: <FileText className="w-5 h-5 text-blue-500" />
      }
    ]
  },
  {
    group: 'Business Proposals',
    icon: <FileText className="w-5 h-5 text-red-500" />,
    files: [
      {
        name: 'Series A Funding Proposal - TechStart.docx',
        type: 'DOCX',
        size: '1.2 MB',
        uploaded: '3 days ago',
        company: 'TechStart Inc.',
        icon: <FileText className="w-5 h-5 text-blue-500" />
      },
      {
        name: 'Market Expansion Strategy 2025.pdf',
        type: 'PDF',
        size: '3.8 MB',
        uploaded: '1 week ago',
        company: 'GreenTech Solutions',
        icon: <FileText className="w-5 h-5 text-red-500" />
      }
    ]
  }
];

export default function DocumentationPage() {
  const [empty, setEmpty] = useState(false);
  return (
    <div className="max-w-3xl mx-auto px-2">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <button onClick={() => setEmpty(e => !e)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium text-sm">Toggle Empty State</button>
      </div>
      {empty ? (
        <div className="text-center py-24 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No documents found</h2>
          <p className="mb-4">You have no documents yet. Documents you receive or upload will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {mockDocuments.map((group, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                {group.icon}
                <h2 className="text-lg font-bold text-gray-900">{group.group}</h2>
                <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{group.files.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {group.files.map((file, fidx) => (
                  <div key={fidx} className="flex items-center py-3 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {file.icon}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{file.name}</div>
                        <div className="text-xs text-gray-500 flex gap-2">
                          <span>{file.type}</span>
                          <span>· {file.size}</span>
                          <span>· Uploaded {file.uploaded}</span>
                          <span>· {file.company}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <button className="p-2 hover:bg-gray-100 rounded" title="View"><Eye className="w-5 h-5 text-gray-500" /></button>
                      <button className="p-2 hover:bg-gray-100 rounded" title="Download"><Download className="w-5 h-5 text-gray-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 