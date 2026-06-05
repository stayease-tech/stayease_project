// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import residentApi from "../residentApi";
import { FileText, Download } from "lucide-react";
import { DashPage } from "../../shared/Dashboard";

export default function residentLease() {
    const [docs, setDocs] = useState([]);
    const [leaseAgreement, setLeaseAgreement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        residentApi.get("/lease/")
            .then((res) => {
                if (res.data.success) {
                    setDocs(res.data.documents);
                    setLeaseAgreement(res.data.leaseAgreement);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashPage>
                <div className="page-header">
                    <div><h1>Lease Agreement</h1><p>View and download your lease agreement</p></div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : !leaseAgreement && docs.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-12 text-gray-500">
                            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No lease documents found.</p>
                            <p className="text-xs mt-1">Your lease agreement will appear here once prepared by the operations team.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaseAgreement && (
                            <div className="card">
                                <div className="card-body">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">Lease Agreement</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Uploaded: {leaseAgreement.uploadedAt?.split("T")[0]}</p>
                                        </div>
                                        {leaseAgreement.pdfUrl && (
                                            <div className="flex gap-2">
                                                <a href={leaseAgreement.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline text-xs flex items-center gap-1">
                                                    <FileText size={14} /> View PDF
                                                </a>
                                                <a href={leaseAgreement.pdfUrl} download className="btn btn-outline text-xs flex items-center gap-1">
                                                    <Download size={14} /> Download
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {docs.map((doc) => (
                            <div key={doc.id} className="card">
                                <div className="card-body">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">{doc.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Recipient: {doc.recipientName}</p>
                                            <p className="text-xs text-gray-500">Created: {doc.createdAt?.split("T")[0]}</p>
                                        </div>
                                        {doc.pdfUrl && (
                                            <div className="flex gap-2">
                                                <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline text-xs flex items-center gap-1">
                                                    <FileText size={14} /> View PDF
                                                </a>
                                                <a href={doc.pdfUrl} download className="btn btn-outline text-xs flex items-center gap-1">
                                                    <Download size={14} /> Download
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </DashPage>
    );
}
