// ============================================================
// MarketSim Pro - QHSE Section Component
// ============================================================

'use client';

import * as React from 'react';
import { Shield, AlertTriangle, Award, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface QhseSectionProps {
  result: RoundResultData;
}

// ------------------------------------------------------------
// Component - Only renders if QHSE is relevant
// ------------------------------------------------------------

export function QhseSection({ result }: QhseSectionProps) {
  // Only show if there's QHSE activity
  const hasQhseActivity =
    result.qhse_score > 0 ||
    result.qhse_audit_triggered ||
    result.qhse_accident_occurred ||
    result.qhse_non_conformity ||
    result.iso_certified ||
    result.qhse_financial_penalty > 0 ||
    result.qhse_eco_subsidy > 0;

  if (!hasQhseActivity) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">QHSE - Qualité, Hygiène, Sécurité, Environnement</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QHSE Score Gauge */}
        {result.qhse_score > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Score QHSE</span>
              <span className="text-sm font-semibold">{result.qhse_score}/100</span>
            </div>
            <Progress
              value={result.qhse_score}
              className={`h-3 ${
                result.qhse_score >= 80
                  ? '[&>div]:bg-green-500'
                  : result.qhse_score >= 50
                  ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-red-500'
              }`}
            />
          </div>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {/* ISO Certification */}
          {result.iso_certified && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Award className="h-3 w-3 mr-1" />
              {result.iso_badge || 'ISO 9001'}
            </Badge>
          )}

          {/* Audit Status */}
          {result.qhse_audit_triggered ? (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Audit déclenché
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Pas d'audit
            </Badge>
          )}

          {/* Accident */}
          {result.qhse_accident_occurred && (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              <XCircle className="h-3 w-3 mr-1" />
              Accident survenu
            </Badge>
          )}

          {/* Non-conformity */}
          {result.qhse_non_conformity && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Non-conformité
            </Badge>
          )}
        </div>

        {/* Financial Impact */}
        {(result.qhse_financial_penalty > 0 || result.qhse_eco_subsidy > 0) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            {result.qhse_financial_penalty > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Pénalité QHSE</span>
                <p className="font-semibold text-red-600">
                  -{formatCurrency(result.qhse_financial_penalty)}
                </p>
              </div>
            )}
            {result.qhse_eco_subsidy > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Subvention écologique</span>
                <p className="font-semibold text-green-600">
                  +{formatCurrency(result.qhse_eco_subsidy)}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
