import ruBase from './ru.json'
import enBase from './en.json'
import thBase from './th.json'
import ruProfile from './profile/ru.json'
import enProfile from './profile/en.json'
import thProfile from './profile/th.json'

export const ru = {
  ...ruBase,
  profile: ruProfile,
}
export const en = {
  ...enBase,
  profile: enProfile,
}
export const th = {
  ...thBase,
  profile: thProfile,
}
