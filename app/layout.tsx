import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shenoy Labs",
  description: "Thoughtful tools, calculators, and projects built in public",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Run early to strip extension-injected attributes before hydration (dev only) */}
        {process.env.NODE_ENV !== 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var ATTR_RE=/^data-gr/;var KNOWN=['data-new-gr-c-s-check-loaded','data-gr-ext-installed'];function stripOnce(){var b=document.body; if(!b) return false;var removed=false;Array.from(b.attributes).forEach(function(a){if(ATTR_RE.test(a.name)||KNOWN.indexOf(a.name)!==-1){b.removeAttribute(a.name);removed=true}});return removed}function stripAll(){try{stripOnce();}catch(e){}};stripAll();var obs=null;function startObserver(){if(!document.body) return; if(obs) obs.disconnect(); obs=new MutationObserver(function(mutations){mutations.forEach(function(m){if(m.type==='attributes'){if(ATTR_RE.test(m.attributeName)||KNOWN.indexOf(m.attributeName)!==-1){try{document.body.removeAttribute(m.attributeName)}catch(e){}}}else if(m.type==='childList'){stripAll()}})});try{obs.observe(document.body,{attributes:true,attributeOldValue:false,childList:true,subtree:false});obs.observe(document.documentElement,{attributes:true,attributeOldValue:false,childList:true,subtree:false});}catch(e){} }
                      // poll for a short period as a fallback
                      var polls=0;var pollId=setInterval(function(){stripAll(); polls++; if(polls>80){clearInterval(pollId); if(obs) obs.disconnect(); } },50);
                      if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',startObserver);}else{startObserver();}
                  }catch(e){} })();`,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
