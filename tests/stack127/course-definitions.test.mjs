import assert from 'node:assert/strict';
import test from 'node:test';
import {courseLessonHref,courseLessonNeighbors} from '../../lib/courses.ts';
import {validateState} from '../../scripts/stack127/publishing/model.mjs';

const course={basePath:'/example',lessons:[
  {slug:'',published:true}, {slug:'first',published:true},
  {slug:'draft',published:false}, {slug:'last',published:true},
]};
test('course links keep the landing URL and navigation skips unpublished lessons',()=>{
  assert.equal(courseLessonHref(course,course.lessons[0]),'/example');
  assert.equal(courseLessonHref(course,course.lessons[3]),'/example/last');
  assert.deepEqual(courseLessonNeighbors(course,'first'),{previous:course.lessons[0],next:course.lessons[3]});
  assert.deepEqual(courseLessonNeighbors(course,'last'),{previous:course.lessons[1],next:null});
  assert.deepEqual(courseLessonNeighbors(course,'draft'),{previous:null,next:null});
});
const registry={label:'Lesson',meta_title:'Lesson',meta_description:'Lesson description',is_published:false,is_indexable:true,cover_image_url:null,page_type:'Course',sitemap_priority:0.5};
const lesson={course_slug:'example',title:'A <mark>lesson</mark>',sidebar_label:'Lesson',display_order:1};
test('course publisher accepts lesson-only children and rejects wrong course ownership',()=>{
  const state={slug:'example/lesson',family:'course',registry,content:null,lesson};
  assert.deepEqual(validateState(state),state);
  assert.throws(()=>validateState({...state,lesson:{...lesson,course_slug:'other'}}),/belong/);
  assert.throws(()=>validateState({...state,lesson:{...lesson,display_order:0}}),/positive/);
});

const {remapDevelopmentPageIds,verifyPageFamilyRestore}=await import('../../scripts/stack127/database/rebuild-development.mjs');
test('recovery preserves development-only courses and remaps both lesson IDs',()=>{
  const original=[{id:2,slug:'example',is_indexable:true},{id:3,slug:'example/lesson',is_indexable:true}];
  const restored=[{id:20,slug:'example',is_indexable:true},{id:30,slug:'example/lesson',is_indexable:true}];
  const rootRows=[{page_id:2,title:'Course'}];
  const lessonRows=[{page_id:3,course_page_id:2,title:'Lesson',display_order:2}];
  const tables=['stack127_pages','stack127_tool_pages','stack127_catalog_pages','stack127_directory_pages','stack127_tool_catalog_memberships','stack127_course_pages','stack127_course_lessons'];
  const source=new Map(tables.map(name=>[name,[]]));
  const target=new Map(tables.map(name=>[name,[]]));target.set('stack127_pages',restored);
  target.set('stack127_course_pages',remapDevelopmentPageIds(rootRows,['page_id'],original,restored));
  target.set('stack127_course_lessons',remapDevelopmentPageIds(lessonRows,['page_id','course_page_id'],original,restored));
  const preserved={pages:original,rows:new Map([['stack127_pages',original],['stack127_course_pages',rootRows],['stack127_course_lessons',lessonRows]])};
  const result=verifyPageFamilyRestore(source,target,preserved).filter(row=>row.table.startsWith('stack127_course_'));
  assert.equal(result.length,2);assert.ok(result.every(row=>row.preservedRowsVerified && row.preservedDevelopmentRows===1));
  target.get('stack127_course_lessons')[0].title='Changed unexpectedly';
  assert.throws(()=>verifyPageFamilyRestore(source,target,preserved),/Content mismatch/);
});

const {inspectPublishedHtml}=await import('../../scripts/stack127/publishing/verify.mjs');
test('course public verification uses the landing lesson heading',()=>{
  const state={slug:'example',family:'course',registry:{...registry,is_published:true},content:{title:'Whole course'},lesson};
  const html='<title>Lesson</title><meta name="description" content="Lesson description"><meta name="robots" content="index, follow"><link rel="canonical" href="https://stack127.com/example"><meta name="stack127-content-revision" content="revision"><h1>A <mark>lesson</mark></h1>';
  assert.doesNotThrow(()=>inspectPublishedHtml(html,state,'revision','https://stack127.com'));
  assert.throws(()=>inspectPublishedHtml(html.replace('<h1>A <mark>lesson</mark></h1>','<h1>Whole course</h1>'),state,'revision','https://stack127.com'),/heading/);
});
