import {KeyResult, Objective, ObjectiveWithProgress} from "@/types";
import {atom, useAtomValue, useSetAtom} from "jotai";
import {calculateObjectiveStatus} from "@/lib/api";

interface ObjectInPool {
  object: Objective | KeyResult,
  type: "OBJECTIVE" | "KEY_RESULT",
}

export const objectPool = atom<ObjectInPool[]>([]);

const objectives = atom<ObjectiveWithProgress[]>(
    get => get(objectPool)
    .filter(o => o.type === 'OBJECTIVE')
    .map(o => o.object as Objective)
    .map(o => ({
      ...o,
      key_results: get(objectPool)
      .filter(o => o.type === 'KEY_RESULT')
      .map(k => k.object as KeyResult)
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
  const objective = allObjects.find(o => o.type === 'OBJECTIVE' && o.object.id === kr.objective_id)
  if (!objective || !objective.object) {
    throw new Error(`Objective with id ${kr.objective_id} not found`)
  }
  (objective.object as Objective).key_results.push(kr)
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
