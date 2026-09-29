import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPath } from '../components/LearningPath';
import type { MissionStore } from '../sandbox/state';
import { fixtureSav } from '../sandbox/testData';
import type { TaskStore } from './kit/storage';

/** Rendert eine Sitzung des Lernpfads mit der synthetischen Testdatei (nur für Tests). */
export const testData = () => ({ sav: fixtureSav(), fileName: 'ZA8831_v1-3-0.sav', version: 'v1.3.0' });
export const renderSession = (sessionIndex: number, withData = true, store?: MissionStore, tasks: TaskStore = { tasks: {} }) =>
  renderToStaticMarkup(createElement(LearningPath, {
    onConcept: () => {}, sessionIndex, onSessionChange: () => {}, initialData: withData ? testData() : null, initialStore: store, initialTasks: tasks,
  }));
