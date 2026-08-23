import ruBase from './ru.json'
import enBase from './en.json'
import thBase from './th.json'
import ruProfile from './profile/ru.json'
import enProfile from './profile/en.json'
import thProfile from './profile/th.json'
import ruDevPanel from './dev-panel/ru.json'
import enDevPanel from './dev-panel/en.json'
import thDevPanel from './dev-panel/th.json'
import ruAppSidebar from './app-sidebar/ru.json'
import enAppSidebar from './app-sidebar/en.json'
import thAppSidebar from './app-sidebar/th.json'

export const ru = {
  ...ruBase,
  ...ruAppSidebar,
  profile: ruProfile,
  devPanel: ruDevPanel,
}
export const en = {
  ...enBase,
  ...enAppSidebar,
  profile: enProfile,
  devPanel: enDevPanel,
}
export const th = {
  ...thBase,
  ...thAppSidebar,
  profile: thProfile,
  devPanel: thDevPanel,
}
