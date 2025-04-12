import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity('analytics')
export class Analytic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  correctPassphraseCount: number;

  @Column({ default: 0 })
  incorrectPassphraseCount: number;

  @Column({ default: 0 })
  correctPasswordCount: number;

  @Column({ default: 0 })
  incorrectPasswordCount: number;
}
