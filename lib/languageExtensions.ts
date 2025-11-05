// lib/languageExtensions.ts
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { php } from "@codemirror/lang-php";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";
import type {LanguageSupport} from "@codemirror/language"
export const extensionToLanguage = (ext: string):[LanguageSupport,string,string,string] => {
   switch (ext) {
    case 'js':
       return [javascript(), 'javascript', '18.15.0','']; //powershell 7.1.4
    case 'ts':
      return [javascript(), 'typeScript', '5.0.3',''];
    case 'py':
      return [python(), 'python', '3.10',''];
    case 'java':
      return [java(), 'java', '15.0.2',''];
    case 'html':
      return [html(), 'HTML', '5',''];
    case 'rs':
      return [rust(), 'rust', '1.68.2',''];
    case 'sql':
      return [sql(), 'sqlite3', '3.36.0',''];
    case 'php':
      return [php(), 'php', '8.2',''];
    case 'cpp':
      return [cpp(), 'cpp', '10.2.0',''];
    case 'c':
      return [cpp(), 'c', '10.2.0',''];
    case 'go':
      return [go(), 'go', '1.16.2',''];
    default:
      return [javascript(), 'JavaScript', '18.15.0',''];
  }
};
