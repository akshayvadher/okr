import {KeyResult, Objective, ObjectiveWithProgress} from "@/types";
import {atom, useAtomValue, useSetAtom} from "jotai";
import {calculateObjectiveStatus} from "@/lib/api";
import {parseISO} from "date-fns";

export interface ObjectInPool {
  object: Objective | KeyResult,
  type: "OBJECTIVE" | "KEY_RESULT",
}

export const objectPool = atom<ObjectInPool[]>([]);
export const useGetAll = () => useAtomValue(objectPool);

const objectives = atom<ObjectiveWithProgress[]>(
    get => get(objectPool)
    .filter(o => o.type === 'OBJECTIVE')
    .map(o => o.object as Objective)
    .map(o => ({
      ...o,
      key_results: get(objectPool)
      .filter(k => k.type === 'KEY_RESULT')
      .filter(k => (k.object as KeyResult).objective_id === o.id)
      .map(k => k.object as KeyResult)
      .sort((a, b) => parseISO(a.created_at).getMilliseconds() - parseISO(b.created_at).getMilliseconds())
    }))
    .map(o => ({
      ...o,
      ...calculateObjectiveStatus(o),
    }))
)

const addObjective = atom(null, (get, set, o: Objective) => {
  const allObjects = get(objectPool)
  set(objectPool, [...allObjects, {
    object: o,
    type: 'OBJECTIVE',
  }])
})

export const useObjectiveFromPool = () => useAtomValue(objectives)
export const useAddObjective = () => useSetAtom(addObjective)

const addKeyResult = atom(null, (get, set, kr: KeyResult) => {
  const allObjects = get(objectPool)
  set(objectPool, [...allObjects, {
    object: kr,
    type: 'KEY_RESULT',
  }])
})
const updateKeyResultProgress = atom(null, (get, set, {id, progress}: {
  id: string,
  progress: number
}) => {
  const allObjects = get(objectPool)
  const keyResult = allObjects.find(o => o.type === 'KEY_RESULT' && o.object.id === id)
  if (!keyResult || !keyResult.object) {
    throw new Error(`Key result with id ${id} not found`)
  }
  (keyResult.object as KeyResult).current = progress;

  set(objectPool, [...allObjects.filter(o => o.object.id !== keyResult.object.id), keyResult])
})
export const useAddKeyResult = () => useSetAtom(addKeyResult)
export const useUpdateKeyResultProgress = () => useSetAtom(updateKeyResultProgress)
