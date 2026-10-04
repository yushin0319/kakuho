"""add seat_groups.name and seat_groups.total_capacity

Revision ID: 8f0d56dff6ab
Revises: 0f4670d615b9
Create Date: 2026-10-05 08:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f0d56dff6ab'
down_revision: Union[str, None] = '0f4670d615b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# models.py には #2 (2026-02-18) で追加されたが migration が無かった 2 列。
# 本番 DB に手で追加済みの場合もあるので、無い列だけ足す。既存行は NULL のまま
# (レスポンスのスキーマは両方 None を許す)。
COLUMN_TYPES = {
    'name': sa.String,
    'total_capacity': sa.Integer,
}


def _existing_columns() -> set[str]:
    return {c['name'] for c in sa.inspect(op.get_bind()).get_columns('seat_groups')}


def upgrade() -> None:
    existing = _existing_columns()
    for name, column_type in COLUMN_TYPES.items():
        if name not in existing:
            op.add_column('seat_groups', sa.Column(name, column_type(), nullable=True))


def downgrade() -> None:
    existing = _existing_columns()
    for name in reversed(list(COLUMN_TYPES)):
        if name in existing:
            op.drop_column('seat_groups', name)
