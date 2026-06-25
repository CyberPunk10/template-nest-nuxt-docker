import ruBase from './ru.json'
import enBase from './en.json'
import thBase from './th.json'
import ruAbout from './about/ru.json'
import enAbout from './about/en.json'
import thAbout from './about/th.json'
import ruProfile from './profile/ru.json'
import enProfile from './profile/en.json'
import thProfile from './profile/th.json'
import ruAppSidebar from './app-sidebar/ru.json'
import enAppSidebar from './app-sidebar/en.json'
import thAppSidebar from './app-sidebar/th.json'

export const ru = {
  ...ruBase,
  ...ruAppSidebar,
  about: ruAbout,
  profile: ruProfile,
}
export const en = {
  ...enBase,
  ...enAppSidebar,
  about: enAbout,
  profile: enProfile,
}
export const th = {
  ...thBase,
  ...thAppSidebar,
  about: thAbout,
  profile: thProfile,
}
