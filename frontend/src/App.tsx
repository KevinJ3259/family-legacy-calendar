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

function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [showForm, setShowForm] = useState(false)

  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)

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

    if (!firstName || !lastName || !dateOfBirth) {
      alert('Please enter first name, last name, and date of birth.')
      return
    }

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
      const isEditing = editingMemberId !== null

      const response = await fetch(
        isEditing
          ? `${API_URL}/family-members/${editingMemberId}`
          : `${API_URL}/family-members`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData),
        }
      )

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Unable to update family member.'
            : 'Unable to add family member.'
        )
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

      if (!response.ok) {
        throw new Error('Unable to load family members.')
      }

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

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (error) {
      console.error('Error loading family member:', error)
      alert('Unable to load family member for editing.')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/family-members/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Unable to delete family member.')
      }

      await loadBirthdays()
    } catch (error) {
      console.error('Error deleting family member:', error)
      alert('Unable to delete family member.')
    }
  }

  const getMonthAbbreviation = (month: number) => {
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ]

    return months[month - 1]
  }

  return (
    <div className="app">
      <header className="header">
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
          <section className="member-form-card">
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
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Middle name"
                  value={middleName}
                  onChange={(event) =>
                    setMiddleName(event.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                />

                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Relationship"
                  value={relationship}
                  onChange={(event) =>
                    setRelationship(event.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
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

        <section className="welcome-card">
          <div>
            <p className="month-label">
              YOUR FAMILY CALENDAR
            </p>

            <h2>{CALENDAR_YEAR} Family Birthdays</h2>

            <p>
              Birthdays and ages are calculated automatically from
              each family member's date of birth.
            </p>
          </div>
        </section>

        <section className="birthday-section">
          <h2>Upcoming Birthdays</h2>

          <div className="birthday-grid">
            {birthdays.map((person) => (
              <article
                className="birthday-card"
                key={person.id}
              >
                <div className="date-badge">
                  <span>
                    {getMonthAbbreviation(person.month)}
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
                      onClick={() => handleEdit(person.id)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(person.id, person.name)
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