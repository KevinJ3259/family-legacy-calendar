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

const API_URL = 'http://127.0.0.1:8000'
const CALENDAR_YEAR = 2026

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

function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(0)

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [relationship, setRelationship] = useState('')
  const [notes, setNotes] = useState('')

  const loadBirthdays = async () => {
    try {
      const response = await fetch(
        `${API_URL}/birthdays/${CALENDAR_YEAR}`
      )

      if (!response.ok) {
        throw new Error('Unable to load birthdays.')
      }

      const data: BirthdayResponse = await response.json()
      setBirthdays(data.birthdays)
    } catch (error) {
      console.error('Error loading birthdays:', error)
    }
  }

  useEffect(() => {
    loadBirthdays()
  }, [])

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
    setShowForm(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      const response = await fetch(
        editingMemberId !== null
          ? `${API_URL}/family-members/${editingMemberId}`
          : `${API_URL}/family-members`,
        {
          method: editingMemberId !== null ? 'PUT' : 'POST',
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
    } catch (error) {
      console.error('Error saving family member:', error)
      alert('Unable to save family member.')
    }
  }

  const handleEdit = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/family-members`)
      const members: FamilyMember[] = await response.json()
      const member = members.find((item) => item.id === id)

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

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error loading family member:', error)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    )

    if (!confirmed) return

    try {
      await fetch(`${API_URL}/family-members/${id}`, {
        method: 'DELETE',
      })

      await loadBirthdays()
    } catch (error) {
      console.error('Error deleting family member:', error)
    }
  }

  const getDaysInMonth = () => {
    return new Date(
      CALENDAR_YEAR,
      selectedMonth + 1,
      0
    ).getDate()
  }

  const getFirstDayOfMonth = () => {
    return new Date(
      CALENDAR_YEAR,
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

      days.push(
        <div key={day} className="calendar-day">
          <div className="calendar-day-number">{day}</div>

          {dayBirthdays.map((person) => (
            <div
              key={person.id}
              className="calendar-birthday"
            >
              <strong>{person.name}</strong>
              <span>Turning {person.turning_age}</span>
            </div>
          ))}
        </div>
      )
    }

    return days
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
            Keep your family's birthdays, memories, and special moments
            together in one place.
          </p>
        </div>

        <button
          className="add-button"
          type="button"
          onClick={handleAddClick}
        >
          + Add Family Member
        </button>
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
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Middle name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />

                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                <option key={month} value={index}>
                  {month}
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

        <section className="print-calendar">
          <div className="print-calendar-header">
            <p>Family Legacy Calendar</p>
            <h2>
              {MONTHS[selectedMonth]} {CALENDAR_YEAR}
            </h2>
          </div>

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

                  <strong>{person.day}</strong>
                </div>

                <div className="birthday-info">
                  <h3>{person.name}</h3>
                  <p>{person.birthday}</p>
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