import { memo,useState } from 'react';
import { cumulative,normalCDF,initialParameters } from '../../domain/foundations/probability';
import type { SurveyRow,ColumnSelection } from '../../domain/survey';
import { DistributionLab,distributionFamily } from './DistributionLab';
import { InferenceLab } from './InferenceLab';
import { SamplingLab } from './SamplingLab';
import { ProbabilityLab,EmpiricalLab,ConfoundingLab } from './DataLabs';
import { RegressionLab,OverfittingLab,MeasurementLab,FactorLab } from './ModelLabs';
import { LabFrame,Slider,fmt } from './Charts';
function ExactLab(){const [n,setN]=useState(20),[p,setP]=useState(.2),[fraction,setFraction]=useState(.3),k=Math.round(n*fraction),exact=1-cumulative('binomial',k-1,{...initialParameters,n,p}),approx=normalCDF(-(k-.5-n*p)/Math.sqrt(n*p*(1-p)));return <LabFrame title="Exakte Randwahrscheinlichkeit und Näherung"><Slider label="Unabhängige Versuche n" min={5} max={200} step={5} value={n} onChange={setN}/><Slider label="Erfolgswahrscheinlichkeit unter H₀" min={.05} max={.95} step={.05} value={p} onChange={setP}/><Slider label="Beobachteter Erfolgsanteil (k wird gerundet)" min={0} max={1} step={.05} value={fraction} onChange={setFraction}/><div className="lab-result"><span>Beobachtet: k = {k} Erfolge</span><strong>Exakt: P(X ≥ k) = {fmt(exact,5)}</strong><span>Normalnäherung mit Kontinuitätskorrektur: {fmt(approx,5)}</span></div><p>Rechtsseitiger Binomialtest im unabhängigen Modell. „Exakt“ bezeichnet die Berechnung unter diesem Modell; falsche Unabhängigkeitsannahmen werden dadurch nicht behoben. Bei extremen Erfolgswahrscheinlichkeiten und kleinen n kann die Näherung schlecht sein.</p></LabFrame>;}
function FoundationLabImpl({id,rows,selection}:{id:string;rows?:SurveyRow[];selection?:ColumnSelection}){
 if(distributionFamily[id])return <DistributionLab key={id} id={id}/>;
 if(['probability','conditional_probability','stochastic_independence'].includes(id))return <ProbabilityLab/>;
 if(['population_parameter','estimator','sampling_distribution','random_sampling','law_large_numbers','central_limit'].includes(id))return <SamplingLab focus={id}/>;
 if(['expectation','population_variance','general_df'].includes(id))return <DistributionLab id={id==='general_df'?'t_distribution':id==='expectation'?'binomial_distribution':'normal_distribution'}/>;
 if(['null_distribution','test_sides','alpha_level','critical_value','type_errors','power','p_value','confidence','test_statistic'].includes(id))return <InferenceLab/>;
 if(id==='exact_asymptotic')return <ExactLab/>;
 if(['empirical_distribution','sampling_bias','missing_mechanisms'].includes(id)&&rows&&selection)return <EmpiricalLab rows={rows} selection={selection} missing={id!=='empirical_distribution'}/>;
 if(['variance_assumption','outliers_influence','explained_variance','prediction_interval'].includes(id))return <RegressionLab/>;
 if(id==='overfitting')return <OverfittingLab/>;
 if(['confounding','causality','random_assignment'].includes(id))return <ConfoundingLab/>;
 if(['operationalization','measurement_error','validity'].includes(id))return <MeasurementLab/>;
 if(['dimensionality','correlation_matrix','loadings','eigenvalues','communality','rotation','multicollinearity'].includes(id))return <FactorLab/>;
 return null;
}

export const FoundationLab=memo(FoundationLabImpl);
/** Ob es für den Begriff eine bisherige Übung gibt (für die zugeklappte „Weitere Übung“ unter neuen Erklärungen, IB3). FoundationLabImpl ruft keine Hooks auf. */
export const hasFoundationLab=(id:string,rows?:SurveyRow[],selection?:ColumnSelection)=>FoundationLabImpl({id,rows,selection})!==null;
