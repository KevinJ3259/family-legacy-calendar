import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Birthday = {
  id: number
  name: string
  birthday: string
  month: number
  day: number
  turning_age: number
  display: string
}

type BirthdayResponse = {
  calendar_year: number
  birthdays: Birthday[]
}

type FamilyMember = {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  date_of_birth: string
  relationship: string | null
  photo_url: string | null
  notes: string | null
}

type FamilyEvent = {
  id: number
  title: string
  event_date: string
  event_type: string
  description: string | null
}

type MonthPhoto = {
  id: number
  year: number
  month: number
  photo_url: string
  caption: string | null
}

type AuthResponse = {
  access_token: string
  token_type: string
  user_name: string
  family_id: number
  family_name: string
}

const API_URL = 'http://127.0.0.1:8000'
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const YEARS = Array.from(
  { length: 100 },
  (_, index) => 2020 + index
)

function App() {
  const [token, setToken] = useState(
    localStorage.getItem('family_legacy_token') || ''
  )

  const [userName, setUserName] = useState(
    localStorage.getItem('family_legacy_user_name') || ''
  )

  const [familyName, setFamilyName] = useState(
    localStorage.getItem('family_legacy_family_name') || ''
  )

  const [authMode, setAuthMode] =
    useState<'login' | 'register'>('login')

  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authFamilyName, setAuthFamilyName] = useState('')
  const [authError, setAuthError] = useState('')

  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [events, setEvents] = useState<FamilyEvent[]>([])
  const [familyMembers, setFamilyMembers] =
    useState<FamilyMember[]>([])

  const [monthPhotos, setMonthPhotos] = useState<MonthPhoto[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)

  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEventId, setEditingEventId] =
    useState<number | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventType, setEventType] = useState('')
  const [eventDescription, setEventDescription] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingMemberId, setEditingMemberId] =
    useState<number | null>(null)

  const [selectedMonth, setSelectedMonth] = useState(0)
  const [selectedYear, setSelectedYear] = useState(2026)

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [relationship, setRelationship] = useState('')
  const [notes, setNotes] = useState('')

  const authFetch = async (
    url: string,
    options: RequestInit = {}
  ) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('family_legacy_token')
    localStorage.removeItem('family_legacy_user_name')
    localStorage.removeItem('family_legacy_family_name')

    setToken('')
    setUserName('')
    setFamilyName('')
    setBirthdays([])
    setEvents([])
    setFamilyMembers([])
    setMonthPhotos([])
    setShowForm(false)
    setShowEventForm(false)
    setEditingMemberId(null)
    setEditingEventId(null)
  }

  const loadBirthdays = async () => {
    if (!token) return

    try {
      const response = await authFetch(
        `${API_URL}/birthdays/${selectedYear}`
      )

      if (response.status === 401 || response.status === 403) {
        handleLogout()
        return
      }

      if (!response.ok) {
        throw new Error('Unable to load birthdays.')
      }

      const data: BirthdayResponse = await response.json()
      setBirthdays(data.birthdays)
    } catch (error) {
      console.error('Error loading birthdays:', error)
    }
  }

  const loadEvents = async () => {
    if (!token) return

    try {
      const response = await authFetch(
        `${API_URL}/family-events`
      )

      if (response.status === 401 || response.status === 403) {
        handleLogout()
        return
      }

      if (!response.ok) {
        throw new Error('Unable to load family events.')
      }

      const data: FamilyEvent[] = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error loading family events:', error)
    }
  }

  const loadFamilyMembers = async () => {
    if (!token) return

    try {
      const response = await authFetch(
        `${API_URL}/family-members`
      )

      if (response.status === 401 || response.status === 403) {
        handleLogout()
        return
      }

      if (!response.ok) {
        throw new Error('Unable to load family members.')
      }

      const data: FamilyMember[] = await response.json()
      setFamilyMembers(data)
    } catch (error) {
      console.error('Error loading family members:', error)
    }
  }

  const loadMonthPhotos = async () => {
    if (!token) return

    try {
      const response = await authFetch(
        `${API_URL}/month-photos`
      )

      if (response.status === 401 || response.status === 403) {
        handleLogout()
        return
      }

      if (!response.ok) {
        throw new Error('Unable to load month photos.')
      }

      const data: MonthPhoto[] = await response.json()
      setMonthPhotos(data)
    } catch (error) {
      console.error('Error loading month photos:', error)
    }
  }

  useEffect(() => {
    if (token) {
      loadBirthdays()
      loadEvents()
      loadFamilyMembers()
      loadMonthPhotos()
    }
  }, [token, selectedYear])

  const saveAuthSession = (data: AuthResponse) => {
    localStorage.setItem(
      'family_legacy_token',
      data.access_token
    )

    localStorage.setItem(
      'family_legacy_user_name',
      data.user_name
    )

    localStorage.setItem(
      'family_legacy_family_name',
      data.family_name
    )

    setToken(data.access_token)
    setUserName(data.user_name)
    setFamilyName(data.family_name)
  }

  const handleAuthSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setAuthError('')

    const endpoint =
      authMode === 'login' ? '/login' : '/register'

    const body =
      authMode === 'login'
        ? {
            email: authEmail,
            password: authPassword,
          }
        : {
            name: authName,
            email: authEmail,
            password: authPassword,
            family_name: authFamilyName,
          }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(
          data.detail || 'Unable to authenticate.'
        )
        return
      }

      saveAuthSession(data)

      setAuthName('')
      setAuthEmail('')
      setAuthPassword('')
      setAuthFamilyName('')
    } catch (error) {
      console.error('Authentication error:', error)
      setAuthError('Unable to connect to the server.')
    }
  }

  const resetForm = () => {
    setFirstName('')
    setMiddleName('')
    setLastName('')
    setDateOfBirth('')
    setRelationship('')
    setNotes('')
    setEditingMemberId(null)
  }

  const handleAddClick = () => {
    resetForm()
    setShowEventForm(false)
    setShowForm(true)
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const memberData = {
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      relationship: relationship || null,
      photo_url: null,
      notes: notes || null,
    }

    try {
      const response = await authFetch(
        editingMemberId !== null
          ? `${API_URL}/family-members/${editingMemberId}`
          : `${API_URL}/family-members`,
        {
          method:
            editingMemberId !== null ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData),
        }
      )

      if (!response.ok) {
        throw new Error('Unable to save family member.')
      }

      resetForm()
      setShowForm(false)

      await loadBirthdays()
      await loadFamilyMembers()
    } catch (error) {
      console.error('Error saving family member:', error)
      alert('Unable to save family member.')
    }
  }

  const handleEdit = (id: number) => {
    const member = familyMembers.find(
      (item) => item.id === id
    )

    if (!member) {
      alert('Family member not found.')
      return
    }

    setEditingMemberId(member.id)
    setFirstName(member.first_name)
    setMiddleName(member.middle_name || '')
    setLastName(member.last_name)
    setDateOfBirth(member.date_of_birth)
    setRelationship(member.relationship || '')
    setNotes(member.notes || '')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleDelete = async (
    id: number,
    name: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    )

    if (!confirmed) return

    try {
      const response = await authFetch(
        `${API_URL}/family-members/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Unable to delete family member.')
      }

      await loadBirthdays()
      await loadFamilyMembers()
    } catch (error) {
      console.error(
        'Error deleting family member:',
        error
      )
    }
  }

  const resetEventForm = () => {
    setEventTitle('')
    setEventDate('')
    setEventType('')
    setEventDescription('')
    setEditingEventId(null)
  }

  const handleAddEventClick = () => {
    resetEventForm()
    setShowForm(false)
    setShowEventForm(true)
  }

  const handleEventSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      const response = await authFetch(
        editingEventId !== null
          ? `${API_URL}/family-events/${editingEventId}`
          : `${API_URL}/family-events`,
        {
          method: editingEventId !== null ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: eventTitle,
            event_date: eventDate,
            event_type: eventType,
            description: eventDescription || null,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.detail || 'Unable to save family event.'
        )
      }

      resetEventForm()
      setShowEventForm(false)
      await loadEvents()
    } catch (error) {
      console.error('Error saving family event:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to save family event.'
      )
    }
  }

  const handleEditEvent = (id: number) => {
    const familyEvent = events.find(
      (item) => item.id === id
    )

    if (!familyEvent) {
      alert('Family event not found.')
      return
    }

    setEditingEventId(familyEvent.id)
    setEventTitle(familyEvent.title)
    setEventDate(familyEvent.event_date)
    setEventType(familyEvent.event_type)
    setEventDescription(familyEvent.description || '')
    setShowForm(false)
    setShowEventForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleDeleteEvent = async (
    id: number,
    title: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${title}?`
    )

    if (!confirmed) return

    try {
      const response = await authFetch(
        `${API_URL}/family-events/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Unable to delete family event.')
      }

      await loadEvents()
    } catch (error) {
      console.error('Error deleting family event:', error)
      alert('Unable to delete family event.')
    }
  }

  const selectedMonthPhoto = monthPhotos.find(
    (photo) =>
      photo.year === selectedYear &&
      photo.month === selectedMonth + 1
  )

  const handleMonthPhotoSave = async () => {
    if (!photoFile) {
      alert('Please choose a photo first.')
      return
    }

    if (selectedMonthPhoto) {
      alert(
        `${MONTHS[selectedMonth]} already has a photo. Delete it first if you want to replace it.`
      )
      return
    }

    setPhotoUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', photoFile)

      const uploadResponse = await authFetch(
        `${API_URL}/upload-image`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null)
        throw new Error(
          errorData?.detail || 'Unable to upload image.'
        )
      }

      const uploadData: { photo_url: string } =
        await uploadResponse.json()

      const saveResponse = await authFetch(
        `${API_URL}/month-photos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            year: selectedYear,
            month: selectedMonth + 1,
            photo_url: uploadData.photo_url,
            caption: photoCaption.trim() || null,
          }),
        }
      )

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => null)
        throw new Error(
          errorData?.detail || 'Unable to save month photo.'
        )
      }

      setPhotoFile(null)
      setPhotoCaption('')

      const fileInput = document.getElementById(
        'month-photo-file'
      ) as HTMLInputElement | null

      if (fileInput) {
        fileInput.value = ''
      }

      await loadMonthPhotos()
    } catch (error) {
      console.error('Error saving month photo:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to save month photo.'
      )
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleDeleteMonthPhoto = async () => {
    if (!selectedMonthPhoto) return

    const confirmed = window.confirm(
      `Delete the photo for ${MONTHS[selectedMonth]}?`
    )

    if (!confirmed) return

    try {
      const response = await authFetch(
        `${API_URL}/month-photos/${selectedMonthPhoto.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Unable to delete month photo.')
      }

      await loadMonthPhotos()
    } catch (error) {
      console.error('Error deleting month photo:', error)
      alert('Unable to delete month photo.')
    }
  }

  const getDaysInMonth = () => {
    return new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate()
  }

  const getFirstDayOfMonth = () => {
    return new Date(
      selectedYear,
      selectedMonth,
      1
    ).getDay()
  }

  const getBirthdaysForDay = (day: number) => {
    return birthdays.filter(
      (person) =>
        person.month === selectedMonth + 1 &&
        person.day === day
    )
  }

  const getEventsForDay = (day: number) => {
    return events.filter((familyEvent) => {
      const [year, month, eventDay] =
        familyEvent.event_date.split('-').map(Number)

      return (
        year === selectedYear &&
        month === selectedMonth + 1 &&
        eventDay === day
      )
    })
  }

  const renderCalendarDays = () => {
    const days = []
    const firstDay = getFirstDayOfMonth()
    const daysInMonth = getDaysInMonth()

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="calendar-day empty-day"
        />
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayBirthdays = getBirthdaysForDay(day)
      const dayEvents = getEventsForDay(day)

      days.push(
        <div
          key={day}
          className="calendar-day"
        >
          <div className="calendar-day-number">
            {day}
          </div>

          {dayBirthdays.map((person) => (
            <div
              key={`birthday-${person.id}`}
              className="calendar-birthday"
            >
              <strong>
                🎂 {person.name}
              </strong>

              <span>
                Turning {person.turning_age}
              </span>
            </div>
          ))}

          {dayEvents.map((familyEvent) => (
            <div
              key={`event-${familyEvent.id}`}
              className="calendar-event"
            >
              <strong>
                {familyEvent.title}
              </strong>

              <span>
                {familyEvent.event_type}
              </span>
            </div>
          ))}
        </div>
      )
    }

    return days
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">
            CELEBRATE • REMEMBER • CONNECT
          </p>

          <h1>Family Legacy Calendar</h1>

          <p className="auth-subtitle">
            Keep your family's birthdays, memories, and
            special moments together in one place.
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={
                authMode === 'login'
                  ? 'auth-tab active'
                  : 'auth-tab'
              }
              onClick={() => {
                setAuthMode('login')
                setAuthError('')
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={
                authMode === 'register'
                  ? 'auth-tab active'
                  : 'auth-tab'
              }
              onClick={() => {
                setAuthMode('register')
                setAuthError('')
              }}
            >
              Create Account
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={handleAuthSubmit}
          >
            {authMode === 'register' && (
              <>
                <label>
                  Your Name
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) =>
                      setAuthName(e.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Family Name
                  <input
                    type="text"
                    placeholder="Example: Jordan Family"
                    value={authFamilyName}
                    onChange={(e) =>
                      setAuthFamilyName(e.target.value)
                    }
                    required
                  />
                </label>
              </>
            )}

            <label>
              Email
              <input
                type="email"
                value={authEmail}
                onChange={(e) =>
                  setAuthEmail(e.target.value)
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authPassword}
                onChange={(e) =>
                  setAuthPassword(e.target.value)
                }
                required
              />
            </label>

            {authError && (
              <p className="auth-error">
                {authError}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
            >
              {authMode === 'login'
                ? 'Login'
                : 'Create Family Account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header no-print">
        <div>
          <p className="eyebrow">
            CELEBRATE • REMEMBER • CONNECT
          </p>

          <h1>Family Legacy Calendar</h1>

          <p className="subtitle">
            {familyName}
          </p>

          <p className="signed-in">
            Signed in as {userName}
          </p>
        </div>

        <div className="header-actions">
          <button
            className="add-button"
            type="button"
            onClick={handleAddClick}
          >
            + Add Family Member
          </button>

          <button
            className="add-button"
            type="button"
            onClick={handleAddEventClick}
          >
            + Add Family Event
          </button>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {showForm && (
          <section className="member-form-card no-print">
            <h2>
              {editingMemberId !== null
                ? 'Edit Family Member'
                : 'Add Family Member'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Middle name"
                  value={middleName}
                  onChange={(e) =>
                    setMiddleName(e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  required
                />

                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) =>
                    setDateOfBirth(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Relationship"
                  value={relationship}
                  onChange={(e) =>
                    setRelationship(e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                >
                  Cancel
                </button>

                <button type="submit">
                  {editingMemberId !== null
                    ? 'Save Changes'
                    : 'Save Family Member'}
                </button>
              </div>
            </form>
          </section>
        )}

        {showEventForm && (
          <section className="member-form-card no-print">
            <h2>
              {editingEventId !== null
                ? 'Edit Family Event'
                : 'Add Family Event'}
            </h2>

            <form onSubmit={handleEventSubmit}>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Event title"
                  value={eventTitle}
                  onChange={(e) =>
                    setEventTitle(e.target.value)
                  }
                  required
                />

                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Event type"
                  value={eventType}
                  onChange={(e) =>
                    setEventType(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={eventDescription}
                  onChange={(e) =>
                    setEventDescription(e.target.value)
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    resetEventForm()
                    setShowEventForm(false)
                  }}
                >
                  Cancel
                </button>

                <button type="submit">
                  {editingEventId !== null
                    ? 'Save Changes'
                    : 'Save Family Event'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="calendar-toolbar no-print">
          <div>
            <label htmlFor="month-select">
              Select Month
            </label>

            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(Number(e.target.value))
              }
            >
              {MONTHS.map((month, index) => (
                <option
                  key={month}
                  value={index}
                >
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year-select">
              Select Year
            </label>

            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(Number(e.target.value))
              }
            >
              {YEARS.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="print-button"
            onClick={() => window.print()}
          >
            Print Calendar
          </button>
        </section>

        <section
          className="member-form-card no-print"
          style={{ marginBottom: '24px' }}
        >
          <h2>{MONTHS[selectedMonth]} Family Photo</h2>

          {selectedMonthPhoto ? (
            <div style={{ textAlign: 'center' }}>
              <img
                src={selectedMonthPhoto.photo_url}
                alt={
                  selectedMonthPhoto.caption ||
                  `${familyName} ${MONTHS[selectedMonth]} family photo`
                }
              style={{
                width: 'auto',
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '360px',
                objectFit: 'contain',
                borderRadius: '12px',
              }}  
              />

              {selectedMonthPhoto.caption && (
                <p>{selectedMonthPhoto.caption}</p>
              )}

              <button
                type="button"
                className="delete-button"
                onClick={handleDeleteMonthPhoto}
              >
                Delete Photo
              </button>
            </div>
          ) : (
            <div>
              <p>
                Add a family photo or memory for{' '}
                {MONTHS[selectedMonth]}.
              </p>

              <div className="form-grid">
                <input
                  id="month-photo-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setPhotoFile(e.target.files?.[0] || null)
                  }
                />

                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={photoCaption}
                  onChange={(e) =>
                    setPhotoCaption(e.target.value)
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleMonthPhotoSave}
                  disabled={photoUploading}
                >
                  {photoUploading
                    ? 'Uploading...'
                    : `Save ${MONTHS[selectedMonth]} Photo`}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="print-calendar">
          <div className="print-calendar-header">
            <p>{familyName}</p>

            <h2>
              {MONTHS[selectedMonth]} {selectedYear}
            </h2>
          </div>

          {selectedMonthPhoto && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <img
                src={selectedMonthPhoto.photo_url}
                alt={
                  selectedMonthPhoto.caption ||
                  `${MONTHS[selectedMonth]} family memory`
                }
              style={{
                width: 'auto',
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '360px',
                objectFit: 'contain',
                borderRadius: '12px',
              }}  
              />

              {selectedMonthPhoto.caption && (
                <p>{selectedMonthPhoto.caption}</p>
              )}
            </div>
          )}

          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-grid">
            {renderCalendarDays()}
          </div>
        </section>

        <section className="family-members-section no-print">
          <h2>Family Members</h2>

          {familyMembers.length === 0 ? (
            <p className="empty-message">
              No family members have been added yet.
            </p>
          ) : (
            <div className="family-members-grid">
              {familyMembers.map((member) => (
                <article
                  className="family-member-card"
                  key={member.id}
                >
                  <div>
                    <h3>
                      {member.first_name}{' '}
                      {member.middle_name
                        ? `${member.middle_name} `
                        : ''}
                      {member.last_name}
                    </h3>

                    <p>
                      <strong>Birthday:</strong>{' '}
                      {member.date_of_birth}
                    </p>

                    {member.relationship && (
                      <p>
                        <strong>Relationship:</strong>{' '}
                        {member.relationship}
                      </p>
                    )}

                    {member.notes && (
                      <p>
                        <strong>Notes:</strong>{' '}
                        {member.notes}
                      </p>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(member.id)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          member.id,
                          `${member.first_name} ${member.last_name}`
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="family-members-section no-print">
          <h2>Family Events</h2>

          {events.length === 0 ? (
            <p className="empty-message">
              No family events have been added yet.
            </p>
          ) : (
            <div className="family-members-grid">
              {events.map((familyEvent) => (
                <article
                  className="family-member-card"
                  key={familyEvent.id}
                >
                  <div>
                    <h3>{familyEvent.title}</h3>

                    <p>
                      <strong>Date:</strong>{' '}
                      {familyEvent.event_date}
                    </p>

                    <p>
                      <strong>Type:</strong>{' '}
                      {familyEvent.event_type}
                    </p>

                    {familyEvent.description && (
                      <p>
                        <strong>Description:</strong>{' '}
                        {familyEvent.description}
                      </p>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEditEvent(familyEvent.id)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDeleteEvent(
                          familyEvent.id,
                          familyEvent.title
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="birthday-section no-print">
          <h2>Upcoming Birthdays</h2>

          <div className="birthday-grid">
            {birthdays.map((person) => (
              <article
                className="birthday-card"
                key={person.id}
              >
                <div className="date-badge">
                  <span>
                    {MONTHS[person.month - 1]
                      .slice(0, 3)
                      .toUpperCase()}
                  </span>

                  <strong>
                    {person.day}
                  </strong>
                </div>

                <div className="birthday-info">
                  <h3>
                    {person.name}
                  </h3>

                  <p>
                    {person.birthday}
                  </p>

                  <strong>
                    Turning {person.turning_age}
                  </strong>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(person.id)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          person.id,
                          person.name
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App