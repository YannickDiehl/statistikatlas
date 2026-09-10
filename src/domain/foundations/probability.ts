// Probability routines for bounded teaching controls. Reference tests use R stats.
export const clamp01=(x:number)=>Math.max(0,Math.min(1,x));
export function logGamma(z:number):number{
 const c=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
 if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
 z-=1;let x=.99999999999980993;for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);const t=z+c.length-.5;
 return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
}
export function gammaP(a:number,x:number):number{
 if(x<=0)return 0;if(!Number.isFinite(x))return 1;
 const factor=Math.exp(-x+a*Math.log(x)-logGamma(a));
 if(x<a+1){let sum=1/a,term=sum;for(let i=1;i<500;i++){term*=x/(a+i);sum+=term;if(Math.abs(term)<Math.abs(sum)*1e-14)break;}return clamp01(sum*factor);}
 let b=x+1-a,c=1e30,d=1/b,h=d;
 for(let i=1;i<500;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-30)d=1e-30;c=b+an/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const delta=d*c;h*=delta;if(Math.abs(delta-1)<1e-14)break;}
 return clamp01(1-factor*h);
}
function betaFraction(a:number,b:number,x:number){let c=1,d=1-(a+b)*x/(a+1);if(Math.abs(d)<1e-30)d=1e-30;d=1/d;let h=d;
 for(let m=1;m<500;m++){const m2=2*m;let aa=m*(b-m)*x/((a+m2-1)*(a+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c;aa=-(a+m)*(a+b+m)*x/((a+m2)*(a+m2+1));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const delta=d*c;h*=delta;if(Math.abs(delta-1)<1e-14)break;}return h;}
export function betaI(x:number,a:number,b:number):number{if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return clamp01(x<(a+1)/(a+b+2)?bt*betaFraction(a,b,x)/a:1-bt*betaFraction(b,a,1-x)/b);}
export function normalCDF(x:number){if(x===0)return .5;const p=gammaP(.5,x*x/2);return x<0?(1-p)/2:(1+p)/2;}
export const normalPDF=(x:number)=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
export function normalQuantile(p:number){let a=-10,b=10;for(let i=0;i<75;i++){const m=(a+b)/2;if(normalCDF(m)<p)a=m;else b=m;}return (a+b)/2;}
const chooseLog=(n:number,k:number)=>k<0||k>n?-Infinity:logGamma(n+1)-logGamma(k+1)-logGamma(n-k+1);
export type Family='normal'|'standard_normal'|'t'|'chi_square'|'f'|'bernoulli'|'binomial'|'hypergeometric';
export type DistributionParameters={mu:number;sigma:number;df:number;df2:number;n:number;p:number;population:number;successes:number};
export const initialParameters:DistributionParameters={mu:0,sigma:1,df:5,df2:20,n:10,p:.3,population:30,successes:12};
export function discrete(f:Family){return ['bernoulli','binomial','hypergeometric'].includes(f);}
export function density(f:Family,x:number,a:DistributionParameters):number{
 if(f==='normal'||f==='standard_normal'){const mu=f==='normal'?a.mu:0,s=f==='normal'?a.sigma:1;return normalPDF((x-mu)/s)/s;}
 if(f==='t')return Math.exp(logGamma((a.df+1)/2)-logGamma(a.df/2)-.5*Math.log(a.df*Math.PI)-(a.df+1)/2*Math.log1p(x*x/a.df));
 if(f==='chi_square'){if(x<0)return 0;if(x===0)return a.df<2?Infinity:a.df===2?.5:0;return Math.exp((a.df/2-1)*Math.log(x)-x/2-a.df/2*Math.log(2)-logGamma(a.df/2));}
 if(f==='f'){if(x<0)return 0;if(x===0)return a.df<2?Infinity:a.df===2?1:0;const h=a.df/2,k=a.df2/2;return Math.exp(h*Math.log(a.df/a.df2)+(h-1)*Math.log(x)-(h+k)*Math.log1p(a.df*x/a.df2)-logGamma(h)-logGamma(k)+logGamma(h+k));}
 if(!Number.isInteger(x))return 0;
 const n=f==='bernoulli'?1:a.n;
 if(f==='hypergeometric')return Math.exp(chooseLog(a.successes,x)+chooseLog(a.population-a.successes,n-x)-chooseLog(a.population,n));
 if(x<0||x>n)return 0;if(a.p===0)return x===0?1:0;if(a.p===1)return x===n?1:0;
 return Math.exp(chooseLog(n,x)+x*Math.log(a.p)+(n-x)*Math.log1p(-a.p));
}
export function cumulative(f:Family,x:number,a:DistributionParameters):number{
 if(f==='normal'||f==='standard_normal')return normalCDF(f==='normal'?(x-a.mu)/a.sigma:x);
 if(f==='t'){if(Math.abs(x)<Math.sqrt(a.df)){const p=betaI(x*x/(a.df+x*x),.5,a.df/2);return x<0?.5-p/2:.5+p/2;}const p=betaI(a.df/(a.df+x*x),a.df/2,.5);return x<0?p/2:1-p/2;}
 if(f==='chi_square')return gammaP(a.df/2,x/2);
 if(f==='f')return x<=0?0:betaI(a.df*x/(a.df*x+a.df2),a.df/2,a.df2/2);
 let sum=0;for(let k=0;k<=Math.min(Math.floor(x),f==='bernoulli'?1:a.n);k++)sum+=density(f,k,a);return clamp01(sum);
}
export function distributionQuantile(f:Family,p:number,a:DistributionParameters):number{
 if(discrete(f)){for(let k=0;k<=(f==='bernoulli'?1:a.n);k++)if(cumulative(f,k,a)>=p-1e-13)return k;return a.n;}
 let left=f==='normal'?a.mu-10*a.sigma:f==='standard_normal'||f==='t'?-100:0,right=f==='normal'?a.mu+10*a.sigma:100;
 while(cumulative(f,right,a)<p&&right<1e8)right*=2;
 while(cumulative(f,left,a)>p&&left>-1e8)left*=2;
 for(let i=0;i<85;i++){const m=(left+right)/2;if(cumulative(f,m,a)<p)left=m;else right=m;}return (left+right)/2;
}
export function normalTest(observed:number,n:number,sigma:number,alpha:number,side:'two'|'greater'|'less',trueEffect=0){
 const se=sigma/Math.sqrt(n),z=observed/se,critical=normalQuantile(1-alpha/(side==='two'?2:1)),p=side==='two'?2*normalCDF(-Math.abs(z)):side==='greater'?normalCDF(-z):normalCDF(z),shift=trueEffect/se;
 const power=side==='two'?normalCDF(-critical-shift)+normalCDF(shift-critical):side==='greater'?normalCDF(shift-critical):normalCDF(-critical-shift);
 const ci=normalQuantile(1-alpha/2)*se;return {se,z,p:clamp01(p),critical,power:clamp01(power),low:observed-ci,high:observed+ci};
}
export function randomSource(seed:number){let state=seed>>>0;return ()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return (state+.5)/4294967296;};}
export function drawNormal(random:()=>number){return Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());}
export function samplingExperiment(n:number,repetitions:number,shape:'normal'|'skewed'|'binary',seed:number){const random=randomSource(seed),draw=()=>shape==='normal'?drawNormal(random):shape==='skewed'?-Math.log(random())-1:(random()<.3?1:0),means:number[]=[],first:number[]=[];for(let r=0;r<repetitions;r++){let sum=0;for(let i=0;i<n;i++){const x=draw();sum+=x;if(r===0)first.push(x);}means.push(sum/n);}return {means,first,mu:shape==='binary'?.3:0,sigma:shape==='binary'?Math.sqrt(.21):1};}

export function distributionMoments(f:Family,a:DistributionParameters){
 if(f==='normal')return {mean:a.mu,variance:a.sigma**2};if(f==='standard_normal')return {mean:0,variance:1};
 if(f==='t')return {mean:a.df>1?0:NaN,variance:a.df>2?a.df/(a.df-2):Infinity};
 if(f==='chi_square')return {mean:a.df,variance:2*a.df};
 if(f==='f')return {mean:a.df2>2?a.df2/(a.df2-2):Infinity,variance:a.df2>4?2*a.df2**2*(a.df+a.df2-2)/(a.df*(a.df2-2)**2*(a.df2-4)):Infinity};
 const n=f==='bernoulli'?1:a.n,p=f==='hypergeometric'?a.successes/a.population:a.p;
 return {mean:n*p,variance:n*p*(1-p)*(f==='hypergeometric'?(a.population-n)/(a.population-1):1)};
}
