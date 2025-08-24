"""Make studpnr unique

Revision ID: 4cb4b4ab022a
Revises: 
Create Date: 2025-08-24 17:24:19.597230

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4cb4b4ab022a'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint('uq_student_studpnr', 'student', ['studpnr'])

def downgrade():
    op.drop_constraint('uq_student_studpnr', 'student', type_='unique')

